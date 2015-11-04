<?php

namespace Jigoshop\Service;

use Jigoshop\Core\Options;
use Jigoshop\Core\Types;
use Jigoshop\Entity\Cart;
use Jigoshop\Entity\EntityInterface;
use Jigoshop\Entity\Order;
use Jigoshop\Factory\Order as Factory;
use WPAL\Wordpress;

/**
 * Orders service.
 *
 * @package Jigoshop\Service
 * @author  Amadeusz Starzykiewicz
 */
class OrderService implements OrderServiceInterface
{
	/** @var \WPAL\Wordpress */
	private $wp;
	/** @var Options */
	private $options;
	/** @var Factory */
	private $factory;

	public function __construct(Wordpress $wp, Options $options, Factory $factory)
	{
		$this->wp = $wp;
		$this->options = $options;
		$this->factory = $factory;

		$wp->addAction('save_post_'.Types\Order::NAME, array($this, 'savePost'), 10);
	}

	/**
	 * Finds item for specified WordPress post.
	 *
	 * @param $post \WP_Post WordPress post.
	 *
	 * @return Order Item found.
	 */
	public function findForPost($post)
	{
		return $this->wp->applyFilters('jigoshop\service\order\find_for_post', $this->factory->fetch($post), $post);
	}

	/**
	 * Prepares order based on cart.
	 *
	 * @param Cart $cart Cart to fetch data from.
	 *
	 * @return Order Prepared order.
	 */
	public function createFromCart(Cart $cart)
	{
		return $this->wp->applyFilters('jigoshop\service\order\create_from_cart', $this->factory->fromCart($cart), $cart);
	}

	/**
	 * Save the order data upon post saving.
	 *
	 * @param $id int Post ID.
	 */
	public function savePost($id)
	{
		// Do not save order when trashing or restoring from trash
		if (!isset($_GET['action'])) {
			$order = $this->factory->create($id);
			$this->save($order);
		}
	}

	/**
	 * Saves order to database.
	 *
	 * @param $object EntityInterface Order to save.
	 *
	 * @throws Exception
	 */
	public function save(EntityInterface $object)
	{
		if (!($object instanceof Order)) {
			throw new Exception('Trying to save not an order!');
		}

		$this->wp->doAction('jigoshop\order\before\\'.$object->getStatus(), $object);

		/** @var Order $object */
		$object->setUpdatedAt(new \DateTime());

		if (!$object->getNumber()) {
			$object->setNumber($this->getNextOrderNumber());
		}

		$fields = $object->getStateToSave();

		if (isset($fields['id'])) {
			unset($fields['id']);
		}

		$wpdb = $this->wp->getWPDB();

		if (!$object->getId()) {
			$date = $this->wp->getHelpers()->currentTime('mysql');
			$dateGmt = $this->wp->getHelpers()->currentTime('mysql', true);

			$wpdb->insert($wpdb->posts, array(
				'post_author' => $object->getCustomer()->getId(),
				'post_date' => $date,
				'post_date_gmt' => $dateGmt,
				'post_modified' => $date,
				'post_modified_gmt' => $dateGmt,
				'post_type' => Types::ORDER,
				'post_title' => $object->getTitle(),
				'post_excerpt' => $object->getCustomerNote(),
				'post_status' => $object->getStatus(),
				'post_name' => sanitize_title($object->getTitle()),
				'comment_status' => 'open',
				'ping_status' => 'closed',
			));

			$id = $wpdb->insert_id;
			if (!is_int($id) || $id === 0) {
				throw new Exception(__('Unable to save order. Please try again.', 'jigoshop'));
			}

			$object->setId($id);
			$this->wp->doAction('jigoshop\service\order\new', $id);
			unset($fields['status'], $fields['customer_note']);
		}

		if (!$object->getKey()) {
			$fields['key'] = $this->generateOrderKey($object);
			$object->setKey($fields['key']);
		}

		if (isset($fields['status']) || isset($fields['customer_note'])) {
			$wpdb->update($wpdb->posts, array(
				'post_title' => $object->getTitle(),
				'post_status' => $object->getStatus(),
				'post_excerpt' => $object->getCustomerNote(),
			), array('ID' => $object->getId()));

			unset($fields['customer_note'], $fields['status']);
		}

		if (isset($fields['update_messages']) && !empty($fields['update_messages'])) {
			foreach ($fields['update_messages'] as $messages) {
				$this->wp->doAction('jigoshop\order\\'.$messages['old_status'].'_to_'.$messages['new_status'], $object);
				$this->addNote($object, sprintf(__('%sOrder status changed from %s to %s.', 'jigoshop'), $messages['message'], Order\Status::getName($messages['old_status']),
					Order\Status::getName($messages['new_status'])));
			}
			unset($fields['update_messages']);
		}

		if (isset($fields['items'])) {
			// TODO: Check again if we have enough stock

			$existing = array_map(function ($item){
				/** @var $item Order\Item */
				return $item->getId();
			}, $fields['items']);
			$this->removeAllExcept($object->getId(), $existing);

			foreach ($fields['items'] as $item) {
				/** @var $item Order\Item */
				$data = array(
					'order_id' => $object->getId(),
					'product_id' => $item->getProduct() ? $item->getProduct()->getId() : null,
					'product_type' => $item->getType(),
					'title' => $item->getName(),
					'price' => $item->getPrice(),
					'tax' => $item->getTax(),
					'quantity' => $item->getQuantity(),
					'cost' => $item->getCost(),
				);

				if ($item->getId() !== null) {
					$wpdb->update($wpdb->prefix.'jigoshop_order_item', $data, array('id' => $item->getId()));
				} else {
					$wpdb->insert($wpdb->prefix.'jigoshop_order_item', $data);
					$item->setId($wpdb->insert_id);
				}

				foreach ($item->getAllMeta() as $meta) {
					/** @var $meta Order\Item\Meta */
					$this->saveItemMeta($item, $meta);
				}
			}

			$reduceStatus = $this->wp->applyFilters('jigoshop\product\reduce_stock_status', Order\Status::PROCESSING, $object);
			if ($object->getStatus() == $reduceStatus) {
				foreach ($object->getItems() as $item) {
					/** @var \Jigoshop\Entity\Order\Item $item */
					$this->wp->doAction('jigoshop\product\sold', $item->getProduct(), $item->getQuantity(), $item);
				}
			}

			if ($object->getStatus() == Order\Status::COMPLETED) {
				$object->setCompletedAt();
			}

			unset($fields['items']);
		}

		foreach ($fields as $field => $value) {
			$this->wp->updatePostMeta($object->getId(), $field, $this->wp->getHelpers()->escSql($value));
		}

		$this->wp->doAction('jigoshop\service\order\save', $object);
		$this->wp->doAction('jigoshop\order\after\\'.$object->getStatus(), $object);
		$notifyLowStock = $this->options->get('products.notify_low_stock');
		$notifyOutOfStock = $this->options->get('products.notify_out_of_stock');

		if ($notifyLowStock || $notifyOutOfStock) {
			$threshold = $this->options->get('products.low_stock_threshold');
			foreach ($object->getItems() as $item) {
				$stock = $this->wp->applyFilters('jigoshop\product\get_stock', false, $item);
				$product = $item->getProduct();

				if ($notifyOutOfStock && $stock !== false && $stock == 0) {
					$this->wp->doAction('jigoshop\product\out_of_stock', $product);
					continue;
				}
				if ($notifyLowStock && $stock !== false && $stock <= $threshold) {
					$this->wp->doAction('jigoshop\product\low_stock', $product);
				}
			}
		}

		/**
		 * TODO: If configured - send emails on backorders
		 * $this->wp->addAction('jigoshop\product\backorders', array($this, 'productBackorders'));
		 */
	}

	private function getNextOrderNumber()
	{
		$wpdb = $this->wp->getWPDB();

		return $this->wp->applyFilters('jigoshop\service\order\next_order_number', $wpdb->get_var($wpdb->prepare(
			"SELECT MAX(ID)+1 FROM {$wpdb->posts} WHERE post_type = %s",
			array(Types::ORDER)
		)));
	}

	/**
	 * @param $object Order
	 *
	 * @return string Random order key.
	 */
	private function generateOrderKey($object)
	{
		$fields = $object->getStateToSave();
		$keys = array_keys($fields);
		$min = 0;
		$max = count($keys) - 1;
		$source = time().$this->wp->getCurrentUserId();
		$fields = array_map(function ($item){
			return is_array($item) ? serialize($item) : $item;
		}, $fields);

		for ($i = 0; $i < 5; $i++) {
			$source .= $fields[$keys[rand($min, $max)]];
		}

		return hash('md5', str_repeat($source, 5));
	}

	/**
	 * Adds a note to the order.
	 *
	 * @param $order   Order The order.
	 * @param $note    string Note text.
	 * @param $private bool Is note private?
	 *
	 * @return int Note ID.
	 */
	public function addNote($order, $note, $private = true)
	{
		$comment = array(
			'comment_post_ID' => $order->getId(),
			'comment_author' => __('Jigoshop', 'jigoshop'),
			'comment_author_email' => '',
			'comment_author_url' => '',
			'comment_content' => $note,
			'comment_type' => 'order_note',
			'comment_agent' => __('Jigoshop', 'jigoshop'),
			'comment_parent' => 0,
			'comment_date' => $this->wp->getHelpers()->currentTime('mysql'),
			'comment_date_gmt' => $this->wp->getHelpers()->currentTime('mysql', true),
			'comment_approved' => true
		);

		$comment = $this->wp->applyFilters('jigoshop\service\order\add_note', $comment, $order, $note, $private);
		$comment_id = $this->wp->wpInsertComment($comment);
		$this->wp->addCommentMeta($comment_id, 'private', $private);

		return $comment_id;
	}

	/**
	 * @param $order int Order ID.
	 * @param $ids   array IDs to preserve.
	 */
	public function removeAllExcept($order, $ids)
	{
		$wpdb = $this->wp->getWPDB();
		$ids = join(',', array_filter(array_map(function ($item){
			return (int)$item;
		}, $ids)));
		// Support for removing all items
		if (empty($ids)) {
			$ids = '0';
		}
		$query = $wpdb->prepare("DELETE FROM {$wpdb->prefix}jigoshop_order_item WHERE id NOT IN ({$ids}) AND order_id = %d", array($order));
		$wpdb->query($query);
	}

	/**
	 * Saves item meta value to database.
	 *
	 * @param $item Order\Item Item of the meta.
	 * @param $meta Order\Item\Meta Meta to save.
	 */
	public function saveItemMeta($item, $meta)
	{
		$wpdb = $this->wp->getWPDB();
		$wpdb->replace($wpdb->prefix.'jigoshop_order_item_meta', array(
			'item_id' => $item->getId(),
			'meta_key' => $meta->getKey(),
			'meta_value' => $meta->getValue(),
		));
	}

	/**
	 * @param $month int Month to find orders from.
	 * @param $year  int Year to find orders from.
	 *
	 * @return array List of orders from selected month.
	 */
	public function findFromMonth($month, $year)
	{
		$restriction = function ($where = '') use ($month, $year){
			$firstDay = strtotime("{$year}-{$month}-01");
			$lastDay = strtotime('-1 second', strtotime('+1 month', $firstDay));

			$after = date('Y-m-d H:i:s', $firstDay);
			$before = date('Y-m-d H:i:s', $lastDay);

			$where .= " AND post_date >= '$after'";
			$where .= " AND post_date <= '$before'";

			return $where;
		};

		$this->wp->addFilter('posts_where', $restriction);
		$query = new \WP_Query(array(
			'post_status' => array(Order\Status::COMPLETED),
			'post_type' => Types::ORDER,
			'order' => 'DESC',
			'orderby' => 'post_date',
			'posts_per_page' => -1
		));

		$results = $this->findByQuery($query);
		$this->wp->removeFilter('posts_where', $restriction);

		return $results;
	}

	/**
	 * Finds order specified using WordPress query.
	 *
	 * @param $query \WP_Query WordPress query.
	 *
	 * @return array Collection of found orders
	 */
	public function findByQuery($query)
	{
		// Fetch only IDs
		$query->query_vars['fields'] = 'ids';

		$results = $query->get_posts();
		$that = $this;
		// TODO: Maybe it is good to optimize this to fetch all found orders at once?
		$orders = array_map(function ($order) use ($that){
			return $that->find($order);
		}, $results);

		return $this->wp->applyFilters('jigoshop\service\order\find_by_query', $orders, $query);
	}

	/**
	 * Finds order specified by ID.
	 *
	 * @param $id int Order ID.
	 *
	 * @return Order
	 */
	public function find($id)
	{
		$post = null;

		if ($id !== null) {
			$post = $this->wp->getPost($id);
		}

		return $this->wp->applyFilters('jigoshop\service\order\find', $this->factory->fetch($post), $id);
	}

	/**
	 * @return array List of orders that are too long in Pending status.
	 */
	public function findOldPending()
	{
		$this->wp->addFilter('posts_where', array($this, 'ordersFilter'));
		$query = new \WP_Query(array(
			'post_status' => Order\Status::PENDING,
			'post_type' => Types::ORDER,
			'suppress_filters' => false,
			'fields' => 'ids',
		));
		$results = $this->findByQuery($query);
		$this->wp->removeFilter('posts_where', array($this, 'ordersFilter'));

		return $results;
	}

	/**
	 * @return array List of orders that are too long in Processing status.
	 */
	public function findOldProcessing()
	{
		$this->wp->addFilter('posts_where', array($this, 'ordersFilter'));
		$query = new \WP_Query(array(
			'post_status' => Order\Status::PROCESSING,
			'post_type' => Types::ORDER,
			'suppress_filters' => false,
			'fields' => 'ids',
		));
		$results = $this->findByQuery($query);
		$this->wp->removeFilter('posts_where', array($this, 'ordersFilter'));

		return $results;
	}

	/**
	 * @param string $when Base query.
	 *
	 * @return string Query for orders older than 30 days.
	 * @internal
	 */
	public function ordersFilter($when = '')
	{
		return $when.$this->wp->getWPDB()->prepare(' AND post_date < %s', date('Y-m-d', time() - 30 * 24 * 3600));
	}

	/**
	 * Finds orders for specified user.
	 *
	 * @param $userId int User ID.
	 *
	 * @return array Orders found.
	 */
	public function findForUser($userId)
	{
		$query = new \WP_Query(array(
			'post_status' => array_keys(Order\Status::getStatuses()),
			'post_type' => Types::ORDER,
			'suppress_filters' => false,
			'fields' => 'ids',
			'order' => 'DESC',
			'orderby' => 'post_date',
			'numberposts' => -1, // TODO: Pagination?
			'meta_query' => array(
				array(
					'key' => 'customer_id',
					'value' => $userId,
				),
			),
		));

		return $this->wp->applyFilters('jigoshop\service\order\find_for_user', $this->findByQuery($query), $userId);
	}
}