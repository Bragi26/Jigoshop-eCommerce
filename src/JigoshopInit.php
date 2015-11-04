<?php

if (!defined('JIGOSHOP_LOGGER')) {
	define('JIGOSHOP_LOGGER', 'jigoshop');
}
if (!defined('JIGOSHOP_LOG_DIR')) {
	define('JIGOSHOP_LOG_DIR', JIGOSHOP_DIR.'/log');
}

/**
 * Class initializing and loading of all required files.
 *
 * Separated from main plugin file to achieve PHP 5.2 compatibility - to show proper error messages
 * about required version.
 */
class JigoshopInit
{
	/** @var \Jigoshop\Container */
	private $container;

	public function __construct()
	{
		require_once(JIGOSHOP_DIR.'/vendor/autoload.php');
		require_once(JIGOSHOP_DIR.'/src/functions.php');
		require_once(JIGOSHOP_DIR.'/src/Jigoshop/Container.php');

		// Prepare logger
		$logger = new \Monolog\Logger(JIGOSHOP_LOGGER);
		if (WP_DEBUG) {
			$logger->pushHandler(new \Monolog\Handler\StreamHandler(JIGOSHOP_LOG_DIR.'/jigoshop.debug.log', \Monolog\Logger::DEBUG));
		}
		$logger->pushHandler(new \Monolog\Handler\StreamHandler(JIGOSHOP_LOG_DIR.'/jigoshop.log', \Monolog\Logger::WARNING));
		$logger->pushProcessor(new \Monolog\Processor\IntrospectionProcessor());
		$logger->pushProcessor(new \Monolog\Processor\WebProcessor());
		\Monolog\Registry::addLogger($logger);

		// Configure container
		$this->container = new \Jigoshop\Container();
		$this->container->services->set('di', $this->container);
		$this->container->classLoader->addAutoloadPath('jigoshop', JIGOSHOP_DIR.'/src/');
		$this->container->classLoader->addAutoloadPath('wpal', JIGOSHOP_DIR.'/vendor/megawebmaster/wpal/');

		$configuration = new \Jigoshop\Container\Configuration();
		$configuration->getConfigurations();
		$configuration->init($this->container);

		$this->container->compiler->add(new \Jigoshop\Admin\CompilerPass());
		$this->container->compiler->add(new \Jigoshop\Admin\Migration\CompilerPass());
		$this->container->compiler->add(new \Jigoshop\Admin\Settings\CompilerPass());
		$this->container->compiler->add(new \Jigoshop\Admin\SystemInfo\CompilerPass());
		$this->container->compiler->add(new \Jigoshop\Core\Installer\CompilerPass());
		$this->container->compiler->add(new \Jigoshop\Core\Types\CompilerPass());
		$this->container->compiler->add(new \Jigoshop\Payment\CompilerPass());
		$this->container->compiler->add(new \Jigoshop\Shipping\CompilerPass());

		do_action('jigoshop\plugins\configure', $this->container);
		$this->container->compiler->compile($this->container);

		add_filter('admin_footer_text', array($this, 'footer'));
		add_action('admin_bar_menu', array($this, 'toolbar'), 35);
	}

	/**
	 * Loads Jigoshop.
	 * Prepares Jigoshop to start, then sets up external plugins.
	 * Calls `jigoshop\init` action with \Jigoshop\Container object as parameter - you need to add your extension configuration to the container there.
	 * Also loads Jigoshop 1.x integration layer if necessary.
	 */
	public function load()
	{
		// Override default translations with custom .mo's found in wp-content/languages/jigoshop first.
		load_textdomain('jigoshop', WP_LANG_DIR.'/jigoshop/'.get_locale().'.mo');
		load_plugin_textdomain('jigoshop', false, basename(JIGOSHOP_DIR).'/languages/');
		\Monolog\Registry::getInstance(JIGOSHOP_LOGGER)->addDebug('Loading Jigoshop.');

		// Add links in Plugins page
		add_filter('plugin_action_links_'.JIGOSHOP_BASE_NAME, array($this, 'pluginLinks'));

		// Handle session properly session
		if (!session_id()) {
			session_start();
			session_register_shutdown();
		}
		add_action('wp_logout', function (){
			session_destroy();
			session_regenerate_id();
		});

		// Disable relation links for Jigoshop products
		$disable = function ($value){
			if (\Jigoshop\Frontend\Pages::isProduct()) {
				return false;
			}

			return $value;
		};
		add_filter('index_rel_link', $disable);
		add_filter('parent_post_rel_link', $disable);
		add_filter('start_post_rel_link', $disable);
		add_filter('previous_post_rel_link', $disable);
		add_filter('next_post_rel_link', $disable);

		// Configure container before initializing Jigoshop
		do_action('jigoshop\init', $this->container);
	}

	/**
	 * Initializes Jigoshop.
	 */
	public function init()
	{
		\Monolog\Registry::getInstance(JIGOSHOP_LOGGER)->addDebug('Initialising Jigoshop.');
		// Load query interceptor before Jigoshop
		$interceptor = $this->container->get('jigoshop.query.interceptor');

		if (!($interceptor instanceof Jigoshop\Query\Interceptor)) {
			if (is_admin()) {
				add_action('admin_notices', function (){
					echo '<div class="error"><p>';
					echo __('Invalid query interceptor instance in Jigoshop. The shop will remain inactive until configured properly.', 'jigoshop');
					echo '</p></div>';
				});
			}

			\Monolog\Registry::getInstance(JIGOSHOP_LOGGER)->addEmergency('Invalid query interceptor instance in Jigoshop. Unable to proceed.');

			return;
		}

		$interceptor->run();

		/** @var \Jigoshop\Core\Options $options */
		$options = $this->container->get('jigoshop.options');
		/** @var \WPAL\Wordpress $wp */
		$wp = $this->container->get('wpal');
		Jigoshop\Helper\Country::setOptions($options);
		Jigoshop\Helper\Currency::setOptions($options);
		Jigoshop\Helper\Product::setOptions($options);
		Jigoshop\Helper\Order::setOptions($options);
		Jigoshop\Entity\Order\Status::setWordpress($wp);
		Jigoshop\Frontend\Pages::setOptions($options);

		/** @var \Jigoshop\Core $jigoshop */
		$jigoshop = $this->container->get('jigoshop');

		// Initialize post types and roles
		$this->container->get('jigoshop.types');
		$this->container->get('jigoshop.roles');
		// Initialize Cron
		$this->container->get('jigoshop.cron');

		if (is_admin()) {
			/** @var \Jigoshop\Admin\PageResolver $resolver */
			$resolver = $this->container->get('jigoshop.admin.page_resolver');
			$resolver->resolve($this->container);

			$this->container->get('jigoshop.admin');
		}

		/** @var \Jigoshop\Frontend\PageResolver $resolver */
		$resolver = $this->container->get('jigoshop.frontend.page_resolver');
		$resolver->resolve($this->container);
		$jigoshop->run($this->container);
	}

	public function footer($text)
	{
		$screen = get_current_screen();

		if (strpos($screen->base, 'jigoshop') === false && strpos($screen->parent_base, 'jigoshop') === false && !in_array($screen->post_type, array('product', 'shop_order'))) {
			return $text;
		}

		return sprintf(
			'<a target="_blank" href="https://www.jigoshop.com/support/">%s</a> | %s',
			__('Contact support', 'jigoshop'),
			str_replace(
				array('[stars]', '[link]', '[/link]'),
				array(
					'<a target="_blank" href="http://wordpress.org/support/view/plugin-reviews/jigoshop#postform" >&#9733;&#9733;&#9733;&#9733;&#9733;</a>',
					'<a target="_blank" href="http://wordpress.org/support/view/plugin-reviews/jigoshop#postform" >',
					'</a>'
				),
				__('Add your [stars] on [link]wordpress.org[/link] and keep this plugin essentially free.', 'jigoshop')
			)
		);
	}

	/**
	 * Adds Jigoshop items to admin bar.
	 */
	public function toolbar()
	{
		/** @var WP_Admin_Bar $wp_admin_bar */
		global $wp_admin_bar;
		$manage_products = current_user_can('manage_jigoshop_products');
		$manage_orders = current_user_can('manage_jigoshop_orders');
		$manage_jigoshop = current_user_can('manage_jigoshop');
		$view_reports = current_user_can('view_jigoshop_reports');

		if (!is_admin() && ($manage_jigoshop || $manage_products || $manage_orders || $view_reports)) {
			$wp_admin_bar->add_node(array(
				'id' => 'jigoshop',
				'title' => __('Jigoshop', 'jigoshop'),
				'href' => $manage_jigoshop ? admin_url('admin.php?page=jigoshop') : '',
				'parent' => false,
				'meta' => array(
					'class' => 'jigoshop-toolbar'
				),
			));

			if ($manage_jigoshop) {
				$wp_admin_bar->add_node(array(
					'id' => 'jigoshop_dashboard',
					'title' => __('Dashboard', 'jigoshop'),
					'parent' => 'jigoshop',
					'href' => admin_url('admin.php?page=jigoshop'),
				));
			}

			if ($manage_products) {
				$wp_admin_bar->add_node(array(
					'id' => 'jigoshop_products',
					'title' => __('Products', 'jigoshop'),
					'parent' => 'jigoshop',
					'href' => admin_url('edit.php?post_type=product'),
				));
			}

			if ($manage_orders) {
				$wp_admin_bar->add_node(array(
					'id' => 'jigoshop_orders',
					'title' => __('Orders', 'jigoshop'),
					'parent' => 'jigoshop',
					'href' => admin_url('edit.php?post_type=shop_order'),
				));
			}

			if ($manage_jigoshop) {
				$wp_admin_bar->add_node(array(
					'id' => 'jigoshop_settings',
					'title' => __('Settings', 'jigoshop'),
					'parent' => 'jigoshop',
					'href' => admin_url('admin.php?page=jigoshop_settings'),
				));
			}
		}
	}

	public function pluginLinks($links)
	{
		return array_merge(array(
			'<a href="'.admin_url('admin.php?page=jigoshop_settings').'">'.__('Settings', 'jigoshop').'</a>',
			'<a href="https://www.jigoshop.com/documentation/">'.__('Docs', 'jigoshop').'</a>',
			'<a href="https://www.jigoshop.com/support/">'.__('Support', 'jigoshop').'</a>',
		), $links);
	}

	/**
	 * Installs or updates Jigoshop.
	 *
	 * @param bool $network_wide
	 */
	public function update($network_wide = false)
	{
		// Require upgrade specific files
		require_once(ABSPATH.'/wp-admin/includes/upgrade.php');

		/** @var $wp \WPAL\Wordpress */
		$wp = $this->container->get('wpal');
		/** @var $options \Jigoshop\Core\Installer */
		$installer = $this->container->get('jigoshop.installer');

		if (!$network_wide) {
			$installer->install();

			return;
		}

		$blog = $wp->getWPDB()->blogid;
		$ids = $wp->getWPDB()->get_col("SELECT blog_id FROM {$wp->getWPDB()->blogs}");

		foreach ($ids as $id) {
			switch_to_blog($id);
			$installer->install();
		}
		switch_to_blog($blog);
	}
}