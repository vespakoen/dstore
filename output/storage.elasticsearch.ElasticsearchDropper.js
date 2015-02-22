Ext.data.JsonP.storage_elasticsearch_ElasticsearchDropper({"tagname":"class","name":"storage.elasticsearch.ElasticsearchDropper","autodetected":{},"files":[{"filename":"elasticsearchDropper.js","href":"elasticsearchDropper.html#storage-elasticsearch-ElasticsearchDropper"}],"params":[{"tagname":"params","type":"project.ProjectService","name":"projectService","doc":"\n","html_type":"project.ProjectService"},{"tagname":"params","type":"storage.elasticsearch.ElasticsearchClient","name":"client","doc":"\n","html_type":"<a href=\"#!/api/storage.elasticsearch.ElasticsearchClient\" rel=\"storage.elasticsearch.ElasticsearchClient\" class=\"docClass\">storage.elasticsearch.ElasticsearchClient</a>"}],"members":[{"name":"attachKey","tagname":"property","owner":"storage.elasticsearch.ElasticsearchDropper","id":"property-attachKey","meta":{}},{"name":"_dropIndex","tagname":"method","owner":"storage.elasticsearch.ElasticsearchDropper","id":"method-_dropIndex","meta":{"protected":true}},{"name":"attach","tagname":"method","owner":"storage.elasticsearch.ElasticsearchDropper","id":"method-attach","meta":{}},{"name":"drop","tagname":"method","owner":"storage.elasticsearch.ElasticsearchDropper","id":"method-drop","meta":{}}],"alternateClassNames":[],"aliases":{},"id":"class-storage.elasticsearch.ElasticsearchDropper","short_doc":"ElasticsearchDropper ...","component":false,"superclasses":[],"subclasses":[],"mixedInto":[],"mixins":[],"parentMixins":[],"requires":[],"uses":[],"html":"<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/elasticsearchDropper.html#storage-elasticsearch-ElasticsearchDropper' target='_blank'>elasticsearchDropper.js</a></div></pre><div class='doc-contents'><p>ElasticsearchDropper</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>projectService</span> : project.ProjectService<div class='sub-desc'>\n</div></li><li><span class='pre'>client</span> : <a href=\"#!/api/storage.elasticsearch.ElasticsearchClient\" rel=\"storage.elasticsearch.ElasticsearchClient\" class=\"docClass\">storage.elasticsearch.ElasticsearchClient</a><div class='sub-desc'>\n</div></li></ul></div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-attachKey' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='storage.elasticsearch.ElasticsearchDropper'>storage.elasticsearch.ElasticsearchDropper</span><br/><a href='source/elasticsearchDropper.html#storage-elasticsearch-ElasticsearchDropper-property-attachKey' target='_blank' class='view-source'>view source</a></div><a href='#!/api/storage.elasticsearch.ElasticsearchDropper-property-attachKey' class='name expandable'>attachKey</a> : String<span class=\"signature\"></span></div><div class='description'><div class='short'>IOC attachKey. ...</div><div class='long'><p>IOC attachKey.</p>\n<p>Defaults to: <code>'storage.elasticsearch.dropper'</code></p></div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-_dropIndex' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='storage.elasticsearch.ElasticsearchDropper'>storage.elasticsearch.ElasticsearchDropper</span><br/><a href='source/elasticsearchDropper.html#storage-elasticsearch-ElasticsearchDropper-method-_dropIndex' target='_blank' class='view-source'>view source</a></div><a href='#!/api/storage.elasticsearch.ElasticsearchDropper-method-_dropIndex' class='name expandable'>_dropIndex</a>( <span class='pre'>opts</span> ) : BBPromise.&lt;undefined&gt;<span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>Create a new elasticsearch index. ...</div><div class='long'><p>Create a new elasticsearch index.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>opts</span> : Object<div class='sub-desc'>\n<ul><li><span class='pre'>index</span> : <div class='sub-desc'><p>The name of the index to create</p>\n</div></li></ul></div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>BBPromise.&lt;undefined&gt;</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-attach' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='storage.elasticsearch.ElasticsearchDropper'>storage.elasticsearch.ElasticsearchDropper</span><br/><a href='source/elasticsearchDropper.html#storage-elasticsearch-ElasticsearchDropper-method-attach' target='_blank' class='view-source'>view source</a></div><a href='#!/api/storage.elasticsearch.ElasticsearchDropper-method-attach' class='name expandable'>attach</a>( <span class='pre'>app</span> ) : BBPromise<span class=\"signature\"></span></div><div class='description'><div class='short'>IOC attach. ...</div><div class='long'><p>IOC attach.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>app</span> : <a href=\"#!/api/App\" rel=\"App\" class=\"docClass\">App</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>BBPromise</span><div class='sub-desc'><p>A ElasticsearchDropper instance with resolved dependencies</p>\n</div></li></ul></div></div></div><div id='method-drop' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='storage.elasticsearch.ElasticsearchDropper'>storage.elasticsearch.ElasticsearchDropper</span><br/><a href='source/elasticsearchDropper.html#storage-elasticsearch-ElasticsearchDropper-method-drop' target='_blank' class='view-source'>view source</a></div><a href='#!/api/storage.elasticsearch.ElasticsearchDropper-method-drop' class='name expandable'>drop</a>( <span class='pre'>projectId, projectVersion</span> ) : BBPromise.&lt;undefined&gt;<span class=\"signature\"></span></div><div class='description'><div class='short'>Create / migrate database. ...</div><div class='long'><p>Create / migrate database.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>projectId</span> : String<div class='sub-desc'>\n</div></li><li><span class='pre'>projectVersion</span> : Number<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>BBPromise.&lt;undefined&gt;</span><div class='sub-desc'>\n</div></li></ul></div></div></div></div></div></div></div>","meta":{}});