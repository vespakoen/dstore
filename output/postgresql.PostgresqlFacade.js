Ext.data.JsonP.postgresql_PostgresqlFacade({"tagname":"class","name":"postgresql.PostgresqlFacade","autodetected":{},"files":[{"filename":"postgresqlFacade.js","href":"postgresqlFacade.html#postgresql-PostgresqlFacade"}],"params":[{"tagname":"params","type":"postgresql.PostgresqlRepository","name":"repository","doc":"\n","html_type":"<a href=\"#!/api/postgresql.PostgresqlRepository\" rel=\"postgresql.PostgresqlRepository\" class=\"docClass\">postgresql.PostgresqlRepository</a>"},{"tagname":"params","type":"postgresql.PostgresqlSerializer","name":"serializer","doc":"\n","html_type":"<a href=\"#!/api/postgresql.PostgresqlSerializer\" rel=\"postgresql.PostgresqlSerializer\" class=\"docClass\">postgresql.PostgresqlSerializer</a>"}],"members":[{"name":"attachKey","tagname":"property","owner":"postgresql.PostgresqlFacade","id":"property-attachKey","meta":{}},{"name":"attach","tagname":"method","owner":"postgresql.PostgresqlFacade","id":"method-attach","meta":{}},{"name":"delItem","tagname":"method","owner":"postgresql.PostgresqlFacade","id":"method-delItem","meta":{}},{"name":"migrate","tagname":"method","owner":"postgresql.PostgresqlFacade","id":"method-migrate","meta":{}},{"name":"putItem","tagname":"method","owner":"postgresql.PostgresqlFacade","id":"method-putItem","meta":{}},{"name":"serialize","tagname":"method","owner":"postgresql.PostgresqlFacade","id":"method-serialize","meta":{}}],"alternateClassNames":[],"aliases":{},"id":"class-postgresql.PostgresqlFacade","short_doc":"LevelFacade ...","component":false,"superclasses":[],"subclasses":[],"mixedInto":[],"mixins":[],"parentMixins":[],"requires":[],"uses":[],"html":"<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/postgresqlFacade.html#postgresql-PostgresqlFacade' target='_blank'>postgresqlFacade.js</a></div></pre><div class='doc-contents'><p>LevelFacade</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>repository</span> : <a href=\"#!/api/postgresql.PostgresqlRepository\" rel=\"postgresql.PostgresqlRepository\" class=\"docClass\">postgresql.PostgresqlRepository</a><div class='sub-desc'>\n</div></li><li><span class='pre'>serializer</span> : <a href=\"#!/api/postgresql.PostgresqlSerializer\" rel=\"postgresql.PostgresqlSerializer\" class=\"docClass\">postgresql.PostgresqlSerializer</a><div class='sub-desc'>\n</div></li></ul></div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-attachKey' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='postgresql.PostgresqlFacade'>postgresql.PostgresqlFacade</span><br/><a href='source/postgresqlFacade.html#postgresql-PostgresqlFacade-property-attachKey' target='_blank' class='view-source'>view source</a></div><a href='#!/api/postgresql.PostgresqlFacade-property-attachKey' class='name expandable'>attachKey</a> : String<span class=\"signature\"></span></div><div class='description'><div class='short'>IOC attachKey. ...</div><div class='long'><p>IOC attachKey.</p>\n<p>Defaults to: <code>'postgresql.facade'</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-attach' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='postgresql.PostgresqlFacade'>postgresql.PostgresqlFacade</span><br/><a href='source/postgresqlFacade.html#postgresql-PostgresqlFacade-method-attach' target='_blank' class='view-source'>view source</a></div><a href='#!/api/postgresql.PostgresqlFacade-method-attach' class='name expandable'>attach</a>( <span class='pre'>app</span> ) : BBPromise<span class=\"signature\"></span></div><div class='description'><div class='short'>IOC attach. ...</div><div class='long'><p>IOC attach.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>app</span> : <a href=\"#!/api/App\" rel=\"App\" class=\"docClass\">App</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>BBPromise</span><div class='sub-desc'><p>A PostgresqlFacade instance with resolved dependencies</p>\n</div></li></ul></div></div></div><div id='method-delItem' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='postgresql.PostgresqlFacade'>postgresql.PostgresqlFacade</span><br/><a href='source/postgresqlFacade.html#postgresql-PostgresqlFacade-method-delItem' target='_blank' class='view-source'>view source</a></div><a href='#!/api/postgresql.PostgresqlFacade-method-delItem' class='name expandable'>delItem</a>( <span class='pre'>namespace, schemaKey, version, id</span> ) : BBPromise<span class=\"signature\"></span></div><div class='description'><div class='short'>Delete item ...</div><div class='long'><p>Delete item</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>namespace</span> : String<div class='sub-desc'>\n</div></li><li><span class='pre'>schemaKey</span> : String<div class='sub-desc'>\n</div></li><li><span class='pre'>version</span> : Number<div class='sub-desc'>\n</div></li><li><span class='pre'>id</span> : String<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>BBPromise</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-migrate' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='postgresql.PostgresqlFacade'>postgresql.PostgresqlFacade</span><br/><a href='source/postgresqlFacade.html#postgresql-PostgresqlFacade-method-migrate' target='_blank' class='view-source'>view source</a></div><a href='#!/api/postgresql.PostgresqlFacade-method-migrate' class='name expandable'>migrate</a>( <span class='pre'>namespace, version</span> ) : BBPromise.&lt;undefined&gt;<span class=\"signature\"></span></div><div class='description'><div class='short'>Create / migrate database. ...</div><div class='long'><p>Create / migrate database.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>namespace</span> : String<div class='sub-desc'>\n</div></li><li><span class='pre'>version</span> : Number<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>BBPromise.&lt;undefined&gt;</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-putItem' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='postgresql.PostgresqlFacade'>postgresql.PostgresqlFacade</span><br/><a href='source/postgresqlFacade.html#postgresql-PostgresqlFacade-method-putItem' target='_blank' class='view-source'>view source</a></div><a href='#!/api/postgresql.PostgresqlFacade-method-putItem' class='name expandable'>putItem</a>( <span class='pre'>namespace, schemaKey, item</span> ) : BBPromise<span class=\"signature\"></span></div><div class='description'><div class='short'>Insert / update item ...</div><div class='long'><p>Insert / update item</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>namespace</span> : String<div class='sub-desc'>\n</div></li><li><span class='pre'>schemaKey</span> : String<div class='sub-desc'>\n</div></li><li><span class='pre'>item</span> : Object<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>BBPromise</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-serialize' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='postgresql.PostgresqlFacade'>postgresql.PostgresqlFacade</span><br/><a href='source/postgresqlFacade.html#postgresql-PostgresqlFacade-method-serialize' target='_blank' class='view-source'>view source</a></div><a href='#!/api/postgresql.PostgresqlFacade-method-serialize' class='name expandable'>serialize</a>( <span class='pre'>namespace, schemaKey, item</span> ) : Object<span class=\"signature\"></span></div><div class='description'><div class='short'>Serialize an item to make it compatible with postgresql. ...</div><div class='long'><p>Serialize an item to make it compatible with postgresql.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>namespace</span> : String<div class='sub-desc'>\n</div></li><li><span class='pre'>schemaKey</span> : String<div class='sub-desc'>\n</div></li><li><span class='pre'>item</span> : Object<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Object</span><div class='sub-desc'><p>The serialized item</p>\n</div></li></ul></div></div></div></div></div></div></div>","meta":{}});