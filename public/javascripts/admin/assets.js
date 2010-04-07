document.observe("dom:loaded", function() {
  if($('asset-bucket')){
    new Draggable('asset-bucket', { starteffect: false, endeffect: false });
  }
  if($('page-attachments')){
    Asset.ChooseTabByName('page-attachments');
  }
});

var Asset = {};

Asset.UpdateAssetsTable = function () {
  var search_form = $('filesearchform');
  new Ajax.Updater('assets_table', search_form.action, {
    asynchronous: true,
    evalScripts:  true,
    parameters:   Form.serialize(search_form),
    method: 'get',
    onComplete: 'assets_table'
  });
};

Asset.Tabs = Behavior.create({
  onclick: function(e){
    e.stop();
    Asset.ChooseTab(this.element);
  }
});

// factored out so that it can be called in an ajax response

Asset.ChooseTab = function (element) {
  var pane = $(element.href.split('#')[1]);
  var panes = $('assets').select('.pane');

  var tabs = $('asset-tabs').select('.asset-tab');
  tabs.each(function(tab) {tab.removeClassName('here');});

  element.addClassName('here');;
  panes.each(function(pane) {Element.hide(pane);});
  Element.show($(pane));
}

Asset.ChooseTabByName = function (tabname) {
  var element = $('tab_' + tabname);
  Asset.ChooseTab(element);
}

// factored out so that it can be called after new page part creation

Asset.MakeDraggables = function () {
  $$('div.asset').each(function(element){
    new Draggable(element, { revert: true });
    element.addClassName('move');
  });
}

Asset.DisableLinks = Behavior.create({
  onclick: function(e){
    e.stop();
  }
});

Asset.AddToPage = Behavior.create({
  onclick: function(e){
    e.stop();
    url = this.element.href;
    new Ajax.Updater('attachments', url, {
      asynchronous : true,
      evalScripts  : true,
      method       : 'get'
      // onComplete   : Element.highlight('page-attachments')
    });

  }
});

Asset.MakeDroppables = function () {
  $$('.textarea').each(function(box){
    if (!box.hasClassName('droppable')) {
      Droppables.add(box, {
        accept: 'asset',
        onDrop: function(element) {
          var link = element.select('a.bucket_link')[0];
          var asset_id = element.id.split('_').last();
          var classes = element.className.split(' ');
          var tag_type = classes[0];
          var tag = '<r:assets:' + tag_type + ' id="' + asset_id + '" size="original" />';
          //Form.Element.focus(box);
        	if(!!document.selection){
        		box.focus();
        		var range = (box.range) ? box.range : document.selection.createRange();
        		range.text = tag;
        		range.select();
        	}else if(!!box.setSelectionRange){
        		var selection_start = box.selectionStart;
        		box.value = box.value.substring(0,selection_start) + tag + box.value.substring(box.selectionEnd);
        		box.setSelectionRange(selection_start + tag.length,selection_start + tag.length);
        	}
        	box.focus();
        }
      });
    	box.addClassName('droppable');
    }
  });
}

Asset.ShowBucket = Behavior.create({
  onclick: function(e){
    e.stop();
    var element = $('asset-bucket');
    center(element);
    element.toggle();
    Asset.MakeDroppables();
  }
});

Asset.HideBucket = Behavior.create({
  onclick: function(e){
    e.stop();
    var element = $('asset-bucket');
    element.hide();
  }
});

Asset.FileTypes = Behavior.create({
  onclick: function(e){
    e.stop();
    var element = this.element;
    var type_id = element.text.downcase();
    var type_check = $(type_id + '-check');
    var search_form = $('filesearchform');
    if(element.hasClassName('pressed')) {
      element.removeClassName('pressed');
      type_check.removeAttribute('checked');
    } else {
      element.addClassName('pressed');
      type_check.setAttribute('checked', 'checked');
    }
    new Ajax.Updater('assets_table', search_form.action, {
      asynchronous: true,
      evalScripts:  true,
      parameters:   Form.serialize(search_form),
      method: 'get',
      onComplete: 'assets_table'
    });
  }
});

Asset.WaitingForm = Behavior.create({
  onsubmit: function(e){
    this.element.addClassName('waiting');
    return true;
  }
});

Asset.ResetForm = function (name) {
  var element = $('asset-upload');
  element.removeClassName('waiting');
  element.reset();
}

Asset.AddAsset = function (name) {
  element = $(name);
  asset = element.select('.asset')[0];
  if (window.console && window.console.log) {
    console.log('inserted element is ', element);
    console.log('contained asset is ', asset);
  }
  if (asset) {
    new Draggable(asset, { revert: true });
  }
}


Asset.Tags = Behavior.create({
  onclick: function(e){
    var element = e.findElement('span');
    if (element) {
      var tags = $('asset_tag_list');

      if (element.hasClassName('tag')) {
        element.removeClassName('tag');
        element.addClassName('selected_tag');
        if (tags.value.length > 0) {
          tags.value += ', ';
        }
        tags.value += element.innerHTML.unescapeHTML();
      }
      else if (element.hasClassName('selected_tag')) {
        element.removeClassName('selected_tag');
        element.addClassName('tag');
        tags.value = tags.value.gsub(/\s*,\s*/, ',')
                               .gsub(/^\s+/, '')
                               .gsub(/\s+$/, '')
                               .split(',')
                               .without(element.innerHTML.unescapeHTML())
                               .join(', ');
      }
    }
  }
});

Asset.LabelFilters = Behavior.create({
  onclick: function(e){
    var element = e.findElement('label');
    if (element) {
      if (element.hasClassName('pressed')) {
        element.removeClassName('pressed');
      } else {
        element.addClassName('pressed');
      }
      Asset.UpdateAssetsTable();
    }
  }
});

Asset.Pagination = Behavior.create({
  onclick: function(e){
    var element = e.findElement('div.pagination a');
    if (element) {
      e.stop();

      var current_page = $('current_page');

      if (element.hasClassName('prev_page')) {
        current_page.value = parseInt(current_page.value, 10) - 1;
      }
      else if (element.hasClassName('next_page')) {
        current_page.value = parseInt(current_page.value, 10) + 1;
      }
      else {
        current_page.value = element.innerHTML;
      }

      Asset.UpdateAssetsTable();
    }
  }
});

Event.addBehavior({
  '#asset-tabs a'     : Asset.Tabs,
  '#close-link a'     : Asset.HideBucket,
  '#show-bucket a'    : Asset.ShowBucket,
  '#filesearchform a' : Asset.FileTypes,
  '#asset-upload'     : Asset.WaitingForm,
  'div.asset a'       : Asset.DisableLinks,
  'a.add_asset'       : Asset.AddToPage,
  'div.filters'       : Asset.LabelFilters,
  'div.tags'          : Asset.Tags,
  '#assets_table'     : Asset.Pagination
});
