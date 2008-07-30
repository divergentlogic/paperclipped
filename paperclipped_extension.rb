require_dependency 'application'
require File.dirname(__FILE__) + '/lib/url_additions'
include UrlAdditions

class PaperclippedExtension < Radiant::Extension
  version "1.0"
  description "Assets extension based on the lightweight Paperclip plugin."
  url "http://kbingman.com/assets"
  
  define_routes do |map|
    map.resources :assets, :path_prefix => "/admin"
    map.with_options(:controller => 'assets') do |asset|
      asset.remove_asset      "/admin/assets/:id/remove",               :action => 'remove'
      asset.add_bucket        "/admin/assets/:id/add",                  :action => 'add_bucket'
      asset.clear_bucket      "/admin/assets/clear_bucket",             :action => 'clear_bucket'
      asset.asset_reorder     '/admin/assets/reorder/:id',               :action => 'reorder'
      asset.attach_page_asset '/admin/assets/attach/:asset/page/:page',  :action => 'attach_asset'
      asset.remove_page_asset '/admin/assets/remove/:asset/page/:page',  :action => 'remove_asset'
      asset.refresh_assets    "/admin/assets/refresh/:id",                               :action => 'regenerate_thumbnails'
    end
  end
  
  def activate
    require_dependency 'application'
    
    admin.page.edit.add :main, '/assets/assets_container', :after => "edit_buttons"
    admin.snippet.edit.add :main, '/assets/assets_container', :after => "edit_buttons"
    
    Page.class_eval {
      include PageAssetAssociations
      include AssetTags
    }

    # connect UserActionObserver with my models 
    UserActionObserver.instance.send :add_observer!, Asset 
    
    # This is just needed for testing if you are using mod_rails
    Paperclip.options[:image_magick_path] = Radiant::Config["assets.image_magick_path"] if Radiant::Config["assets.image_magick_path"]
    
    admin.tabs.add "Assets", "/admin/assets", :after => "Snippets", :visibility => [:all]
  end
  
  def deactivate
    # admin.tabs.remove "Assets"
  end
  
end