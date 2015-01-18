Ext.data.JsonP.postgresql_PostgresqlSerializer({"tagname":"class","name":"postgresql.PostgresqlSerializer","autodetected":{},"files":[{"filename":"postgresqlSerializer.js","href":"postgresqlSerializer.html#postgresql-PostgresqlSerializer"}],"extends":"item.ItemSerializer","members":[{"name":"attachKey","tagname":"property","owner":"postgresql.PostgresqlSerializer","id":"property-attachKey","meta":{}},{"name":"_dateStringToMoment","tagname":"method","owner":"item.ItemSerializer","id":"method-_dateStringToMoment","meta":{"protected":true}},{"name":"_serializeBoolean","tagname":"method","owner":"item.ItemSerializer","id":"method-_serializeBoolean","meta":{"protected":true}},{"name":"_serializeDate","tagname":"method","owner":"item.ItemSerializer","id":"method-_serializeDate","meta":{"protected":true}},{"name":"_serializeDatetime","tagname":"method","owner":"item.ItemSerializer","id":"method-_serializeDatetime","meta":{"protected":true}},{"name":"_serializeGeoJSON","tagname":"method","owner":"postgresql.PostgresqlSerializer","id":"method-_serializeGeoJSON","meta":{"protected":true}},{"name":"_serializeItem","tagname":"method","owner":"item.ItemSerializer","id":"method-_serializeItem","meta":{"protected":true}},{"name":"_serializeLinestring","tagname":"method","owner":"postgresql.PostgresqlSerializer","id":"method-_serializeLinestring","meta":{"protected":true}},{"name":"_serializePoint","tagname":"method","owner":"postgresql.PostgresqlSerializer","id":"method-_serializePoint","meta":{"protected":true}},{"name":"_serializeRectangle","tagname":"method","owner":"postgresql.PostgresqlSerializer","id":"method-_serializeRectangle","meta":{"protected":true}},{"name":"_serializeString","tagname":"method","owner":"item.ItemSerializer","id":"method-_serializeString","meta":{"protected":true}},{"name":"_sortKeys","tagname":"method","owner":"item.ItemSerializer","id":"method-_sortKeys","meta":{"protected":true}},{"name":"attach","tagname":"method","owner":"postgresql.PostgresqlSerializer","id":"method-attach","meta":{}},{"name":"serialize","tagname":"method","owner":"postgresql.PostgresqlSerializer","id":"method-serialize","meta":{}}],"alternateClassNames":[],"aliases":{},"id":"class-postgresql.PostgresqlSerializer","component":false,"superclasses":["item.ItemSerializer"],"subclasses":[],"mixedInto":[],"mixins":[],"parentMixins":[],"requires":[],"uses":[],"html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'><a href='#!/api/item.ItemSerializer' rel='item.ItemSerializer' class='docClass'>item.ItemSerializer</a><div class='subclass '><strong>postgresql.PostgresqlSerializer</strong></div></div><h4>Files</h4><div class='dependency'><a href='source/postgresqlSerializer.html#postgresql-PostgresqlSerializer' target='_blank'>postgresqlSerializer.js</a></div></pre><div class='doc-contents'><p>PostgresqlSerializer</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-attachKey' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='postgresql.PostgresqlSerializer'>postgresql.PostgresqlSerializer</span><br/><a href='source/postgresqlSerializer.html#postgresql-PostgresqlSerializer-property-attachKey' target='_blank' class='view-source'>view source</a></div><a href='#!/api/postgresql.PostgresqlSerializer-property-attachKey' class='name expandable'>attachKey</a> : String<span class=\"signature\"></span></div><div class='description'><div class='short'>IOC attachKey. ...</div><div class='long'><p>IOC attachKey.</p>\n<p>Defaults to: <code>'postgresql.serializer'</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-_dateStringToMoment' class='member first-child inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/item.ItemSerializer' rel='item.ItemSerializer' class='defined-in docClass'>item.ItemSerializer</a><br/><a href='source/itemSerializer.html#item-ItemSerializer-method-_dateStringToMoment' target='_blank' class='view-source'>view source</a></div><a href='#!/api/item.ItemSerializer-method-_dateStringToMoment' class='name expandable'>_dateStringToMoment</a>( <span class='pre'>value</span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>Convert a date string to a date object. ...</div><div class='long'><p>Convert a date string to a date object.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>value</span> : string<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-_serializeBoolean' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/item.ItemSerializer' rel='item.ItemSerializer' class='defined-in docClass'>item.ItemSerializer</a><br/><a href='source/itemSerializer.html#item-ItemSerializer-method-_serializeBoolean' target='_blank' class='view-source'>view source</a></div><a href='#!/api/item.ItemSerializer-method-_serializeBoolean' class='name expandable'>_serializeBoolean</a>( <span class='pre'>value</span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>Serialize to boolean. ...</div><div class='long'><p>Serialize to boolean.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>value</span> : string<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-_serializeDate' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/item.ItemSerializer' rel='item.ItemSerializer' class='defined-in docClass'>item.ItemSerializer</a><br/><a href='source/itemSerializer.html#item-ItemSerializer-method-_serializeDate' target='_blank' class='view-source'>view source</a></div><a href='#!/api/item.ItemSerializer-method-_serializeDate' class='name expandable'>_serializeDate</a>( <span class='pre'>value</span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>Serialize a date string to a date. ...</div><div class='long'><p>Serialize a date string to a date.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>value</span> : string<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-_serializeDatetime' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/item.ItemSerializer' rel='item.ItemSerializer' class='defined-in docClass'>item.ItemSerializer</a><br/><a href='source/itemSerializer.html#item-ItemSerializer-method-_serializeDatetime' target='_blank' class='view-source'>view source</a></div><a href='#!/api/item.ItemSerializer-method-_serializeDatetime' class='name expandable'>_serializeDatetime</a>( <span class='pre'>value</span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>Serialize a date string to a datetime. ...</div><div class='long'><p>Serialize a date string to a datetime.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>value</span> : string<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-_serializeGeoJSON' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='postgresql.PostgresqlSerializer'>postgresql.PostgresqlSerializer</span><br/><a href='source/postgresqlSerializer.html#postgresql-PostgresqlSerializer-method-_serializeGeoJSON' target='_blank' class='view-source'>view source</a></div><a href='#!/api/postgresql.PostgresqlSerializer-method-_serializeGeoJSON' class='name expandable'>_serializeGeoJSON</a>( <span class='pre'>value</span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>Serialize to geojson. ...</div><div class='long'><p>Serialize to geojson.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>value</span> : string<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-_serializeItem' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/item.ItemSerializer' rel='item.ItemSerializer' class='defined-in docClass'>item.ItemSerializer</a><br/><a href='source/itemSerializer.html#item-ItemSerializer-method-_serializeItem' target='_blank' class='view-source'>view source</a></div><a href='#!/api/item.ItemSerializer-method-_serializeItem' class='name expandable'>_serializeItem</a>( <span class='pre'>namespace, schemaKey, item</span> ) : Object<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>Serialize an item. ...</div><div class='long'><p>Serialize an item.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>namespace</span> : String<div class='sub-desc'>\n</div></li><li><span class='pre'>schemaKey</span> : String<div class='sub-desc'>\n</div></li><li><span class='pre'>item</span> : Object<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Object</span><div class='sub-desc'><p>The serialized item</p>\n</div></li></ul></div></div></div><div id='method-_serializeLinestring' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='postgresql.PostgresqlSerializer'>postgresql.PostgresqlSerializer</span><br/><a href='source/postgresqlSerializer.html#postgresql-PostgresqlSerializer-method-_serializeLinestring' target='_blank' class='view-source'>view source</a></div><a href='#!/api/postgresql.PostgresqlSerializer-method-_serializeLinestring' class='name expandable'>_serializeLinestring</a>( <span class='pre'>value</span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>Serialize a linestring. ...</div><div class='long'><p>Serialize a linestring.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>value</span> : string<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-_serializePoint' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='postgresql.PostgresqlSerializer'>postgresql.PostgresqlSerializer</span><br/><a href='source/postgresqlSerializer.html#postgresql-PostgresqlSerializer-method-_serializePoint' target='_blank' class='view-source'>view source</a></div><a href='#!/api/postgresql.PostgresqlSerializer-method-_serializePoint' class='name expandable'>_serializePoint</a>( <span class='pre'>value</span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>Serialize a point. ...</div><div class='long'><p>Serialize a point.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>value</span> : string<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-_serializeRectangle' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='postgresql.PostgresqlSerializer'>postgresql.PostgresqlSerializer</span><br/><a href='source/postgresqlSerializer.html#postgresql-PostgresqlSerializer-method-_serializeRectangle' target='_blank' class='view-source'>view source</a></div><a href='#!/api/postgresql.PostgresqlSerializer-method-_serializeRectangle' class='name expandable'>_serializeRectangle</a>( <span class='pre'>value</span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>Serialize a rectangle. ...</div><div class='long'><p>Serialize a rectangle.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>value</span> : string<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-_serializeString' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/item.ItemSerializer' rel='item.ItemSerializer' class='defined-in docClass'>item.ItemSerializer</a><br/><a href='source/itemSerializer.html#item-ItemSerializer-method-_serializeString' target='_blank' class='view-source'>view source</a></div><a href='#!/api/item.ItemSerializer-method-_serializeString' class='name expandable'>_serializeString</a>( <span class='pre'>value</span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>Serialize a string. ...</div><div class='long'><p>Serialize a string.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>value</span> : string<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-_sortKeys' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/item.ItemSerializer' rel='item.ItemSerializer' class='defined-in docClass'>item.ItemSerializer</a><br/><a href='source/itemSerializer.html#item-ItemSerializer-method-_sortKeys' target='_blank' class='view-source'>view source</a></div><a href='#!/api/item.ItemSerializer-method-_sortKeys' class='name expandable'>_sortKeys</a>( <span class='pre'>item</span> )<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>Sort keys of an object. ...</div><div class='long'><p>Sort keys of an object.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>item</span> : Object<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-attach' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='postgresql.PostgresqlSerializer'>postgresql.PostgresqlSerializer</span><br/><a href='source/postgresqlSerializer.html#postgresql-PostgresqlSerializer-method-attach' target='_blank' class='view-source'>view source</a></div><a href='#!/api/postgresql.PostgresqlSerializer-method-attach' class='name expandable'>attach</a>( <span class='pre'>app</span> ) : BBPromise<span class=\"signature\"></span></div><div class='description'><div class='short'>IOC attach. ...</div><div class='long'><p>IOC attach.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>app</span> : <a href=\"#!/api/App\" rel=\"App\" class=\"docClass\">App</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>BBPromise</span><div class='sub-desc'><p>A PostgresqlSerializer instance with resolved dependencies.</p>\n</div></li></ul></div></div></div><div id='method-serialize' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='postgresql.PostgresqlSerializer'>postgresql.PostgresqlSerializer</span><br/><a href='source/postgresqlSerializer.html#postgresql-PostgresqlSerializer-method-serialize' target='_blank' class='view-source'>view source</a></div><a href='#!/api/postgresql.PostgresqlSerializer-method-serialize' class='name expandable'>serialize</a>( <span class='pre'>namespace, schemaKey, item</span> ) : Object<span class=\"signature\"></span></div><div class='description'><div class='short'>Serialize item for PostgreSQL ...</div><div class='long'><p>Serialize item for PostgreSQL</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>namespace</span> : String<div class='sub-desc'>\n</div></li><li><span class='pre'>schemaKey</span> : String<div class='sub-desc'>\n</div></li><li><span class='pre'>item</span> : Object<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Object</span><div class='sub-desc'><p>The serialized item</p>\n</div></li></ul></div></div></div></div></div></div></div>","meta":{}});