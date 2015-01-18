Ext.data.JsonP.item_ItemSerializer({"tagname":"class","name":"item.ItemSerializer","autodetected":{},"files":[{"filename":"itemSerializer.js","href":"itemSerializer.html#item-ItemSerializer"}],"params":[{"tagname":"params","type":"schema.SchemaAdapter","name":"schemaAdapter","doc":"\n","html_type":"<a href=\"#!/api/schema.SchemaAdapter\" rel=\"schema.SchemaAdapter\" class=\"docClass\">schema.SchemaAdapter</a>"}],"members":[{"name":"_dateStringToMoment","tagname":"method","owner":"item.ItemSerializer","id":"method-_dateStringToMoment","meta":{"protected":true}},{"name":"_serializeBoolean","tagname":"method","owner":"item.ItemSerializer","id":"method-_serializeBoolean","meta":{"protected":true}},{"name":"_serializeDate","tagname":"method","owner":"item.ItemSerializer","id":"method-_serializeDate","meta":{"protected":true}},{"name":"_serializeDatetime","tagname":"method","owner":"item.ItemSerializer","id":"method-_serializeDatetime","meta":{"protected":true}},{"name":"_serializeItem","tagname":"method","owner":"item.ItemSerializer","id":"method-_serializeItem","meta":{"protected":true}},{"name":"_serializeString","tagname":"method","owner":"item.ItemSerializer","id":"method-_serializeString","meta":{"protected":true}},{"name":"_sortKeys","tagname":"method","owner":"item.ItemSerializer","id":"method-_sortKeys","meta":{"protected":true}}],"alternateClassNames":[],"aliases":{},"id":"class-item.ItemSerializer","short_doc":"Base class for other serializers ...","component":false,"superclasses":[],"subclasses":["elasticsearch.ElasticsearchSerializer","postgresql.PostgresqlSerializer"],"mixedInto":[],"mixins":[],"parentMixins":[],"requires":[],"uses":[],"html":"<div><pre class=\"hierarchy\"><h4>Subclasses</h4><div class='dependency'><a href='#!/api/elasticsearch.ElasticsearchSerializer' rel='elasticsearch.ElasticsearchSerializer' class='docClass'>elasticsearch.ElasticsearchSerializer</a></div><div class='dependency'><a href='#!/api/postgresql.PostgresqlSerializer' rel='postgresql.PostgresqlSerializer' class='docClass'>postgresql.PostgresqlSerializer</a></div><h4>Files</h4><div class='dependency'><a href='source/itemSerializer.html#item-ItemSerializer' target='_blank'>itemSerializer.js</a></div></pre><div class='doc-contents'><p>Base class for other serializers</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>schemaAdapter</span> : <a href=\"#!/api/schema.SchemaAdapter\" rel=\"schema.SchemaAdapter\" class=\"docClass\">schema.SchemaAdapter</a><div class='sub-desc'>\n</div></li></ul></div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-_dateStringToMoment' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='item.ItemSerializer'>item.ItemSerializer</span><br/><a href='source/itemSerializer.html#item-ItemSerializer-method-_dateStringToMoment' target='_blank' class='view-source'>view source</a></div><a href='#!/api/item.ItemSerializer-method-_dateStringToMoment' class='name expandable'>_dateStringToMoment</a>( <span class='pre'>value</span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>Convert a date string to a date object. ...</div><div class='long'><p>Convert a date string to a date object.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>value</span> : string<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-_serializeBoolean' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='item.ItemSerializer'>item.ItemSerializer</span><br/><a href='source/itemSerializer.html#item-ItemSerializer-method-_serializeBoolean' target='_blank' class='view-source'>view source</a></div><a href='#!/api/item.ItemSerializer-method-_serializeBoolean' class='name expandable'>_serializeBoolean</a>( <span class='pre'>value</span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>Serialize to boolean. ...</div><div class='long'><p>Serialize to boolean.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>value</span> : string<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-_serializeDate' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='item.ItemSerializer'>item.ItemSerializer</span><br/><a href='source/itemSerializer.html#item-ItemSerializer-method-_serializeDate' target='_blank' class='view-source'>view source</a></div><a href='#!/api/item.ItemSerializer-method-_serializeDate' class='name expandable'>_serializeDate</a>( <span class='pre'>value</span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>Serialize a date string to a date. ...</div><div class='long'><p>Serialize a date string to a date.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>value</span> : string<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-_serializeDatetime' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='item.ItemSerializer'>item.ItemSerializer</span><br/><a href='source/itemSerializer.html#item-ItemSerializer-method-_serializeDatetime' target='_blank' class='view-source'>view source</a></div><a href='#!/api/item.ItemSerializer-method-_serializeDatetime' class='name expandable'>_serializeDatetime</a>( <span class='pre'>value</span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>Serialize a date string to a datetime. ...</div><div class='long'><p>Serialize a date string to a datetime.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>value</span> : string<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-_serializeItem' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='item.ItemSerializer'>item.ItemSerializer</span><br/><a href='source/itemSerializer.html#item-ItemSerializer-method-_serializeItem' target='_blank' class='view-source'>view source</a></div><a href='#!/api/item.ItemSerializer-method-_serializeItem' class='name expandable'>_serializeItem</a>( <span class='pre'>namespace, schemaKey, item</span> ) : Object<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>Serialize an item. ...</div><div class='long'><p>Serialize an item.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>namespace</span> : String<div class='sub-desc'>\n</div></li><li><span class='pre'>schemaKey</span> : String<div class='sub-desc'>\n</div></li><li><span class='pre'>item</span> : Object<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Object</span><div class='sub-desc'><p>The serialized item</p>\n</div></li></ul></div></div></div><div id='method-_serializeString' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='item.ItemSerializer'>item.ItemSerializer</span><br/><a href='source/itemSerializer.html#item-ItemSerializer-method-_serializeString' target='_blank' class='view-source'>view source</a></div><a href='#!/api/item.ItemSerializer-method-_serializeString' class='name expandable'>_serializeString</a>( <span class='pre'>value</span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>Serialize a string. ...</div><div class='long'><p>Serialize a string.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>value</span> : string<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-_sortKeys' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='item.ItemSerializer'>item.ItemSerializer</span><br/><a href='source/itemSerializer.html#item-ItemSerializer-method-_sortKeys' target='_blank' class='view-source'>view source</a></div><a href='#!/api/item.ItemSerializer-method-_sortKeys' class='name expandable'>_sortKeys</a>( <span class='pre'>item</span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>Sort keys of an object. ...</div><div class='long'><p>Sort keys of an object.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>item</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div></div></div></div></div>","meta":{}});