module PageAssetAssociations

  def self.included(base)
    base.class_eval {
      has_many :page_attachments, :order => :position
      has_many :assets, :through => :page_attachments, :order => 'page_attachments.position' do
        def tagged_with(tags, options={})
          options = Asset.find_options_for_find_tagged_with(tags, options)
          options[:joins] = "#{options[:joins] } INNER JOIN #{PageAttachment.table_name} ON #{PageAttachment.table_name}.asset_id = assets.id AND #{PageAttachment.table_name}.page_id = #{proxy_owner.id}"
          options[:order] = "#{PageAttachment.table_name}.position"
          Asset.find(:all, options)
        end
      end
    }
  end

end