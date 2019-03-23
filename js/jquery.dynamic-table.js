(function($){
	$.fn.dynamicTable = function(configs)
	{
		var settings = $.extend({
			url: null,
			method: 'POST',
			class : null,
			pageSizes: null,
			pageSizeControlName: null,
			pageSize: 10,
			columnInfo: [],
			pages: [],
			total: 0,
			pagesEachSide: 4,
			page: 1,
			dataItems: [],
			debounce: null,
			debounceTime: 300,
			dataItemsKey: 'data',
			totalItemsKey: 'total',
			request: null,
			params : null,
			pageSizeKey: null,
			xcsrftoken: null,
			tokenKey: null,
		},configs);

		var templatePatternRegex = /\::(.*?)\::/g;
		var tableEl = this;
		

		return this.each(function(){
			parents = $(tableEl).parents('form.search-form-'+$(this).prop('id'));
			if(!parents.length)
			{
				$(this).wrap('<form class="search-form-'+$(this).prop('id')+'"></form>');
				$(this).parent().wrap('<div class="wrapper-for-'+$(this).prop('id')+'"></div>')
				$(this).html('<thead></thead><tbody></tr></tbody>');
				$(this).addClass('table mt-3');
				$(this).addClass(settings.class);
				$(this).parent().prepend(pageSizes());
				$(this).parent().find('.page-sizes').after(setColumnsBinder());
				$(this).find('thead').append(generateTableHeaders());
			}
			loadList(this);
			$(document).on('change','.search-form-'+$(this).prop('id')+' .page-sizes',function(){
				settings.pageSize = parseInt($(this).val());
				settings.page = 1;
				loadList(tableEl);
			});

			$(document).on('change, keyup, focusout, input','.search-form-'+$(this).prop('id')+' input[class*=searchable]',function(){
				if(settings.debounce)
				{
					clearTimeout(settings.debounce);
				}
				settings.debounce = setTimeout(function(){
					settings.page = 1;
					loadList(tableEl)
				}, settings.debounceTime);
			});

			$(document).on('click','.wrapper-for-'+$(this).prop('id')+' .pagination .page-item:not(.prev):not(.next) .page-link',function(){
				settings.page = parseInt($(this).attr('page'));
				loadList(tableEl);
			});

			$(document).on('click','.wrapper-for-'+$(this).prop('id')+' .pagination .page-item.prev .page-link',function(){
				settings.page -= (settings.page>1) ?  1 : 0;
				loadList(tableEl);
			});

			$(document).on('click','.wrapper-for-'+$(this).prop('id')+' .pagination .page-item.next .page-link',function(){
				var totalPages = Math.ceil(settings.total / settings.pageSize);
				settings.page += (settings.page < totalPages) ?  1 : 0;
				loadList(tableEl);
			});

			$(tableEl).parents('.search-form-'+$(tableEl).prop('id')).find('.dropdown .dropdown-content .dropdown-item-dynamic-table input[type="checkbox"]').on("click", function (e) { 
				let dataItem = $(this).parents('.dropdown-item-dynamic-table');
				let index = dataItem.index();
				settings.columnInfo.columns[index].visible = $(this).prop('checked');
				let display = ($(this).prop('checked')) ? 'table-cell' : 'none';

				$(tableEl).find('tr').each(function(){
					let tds = $(this).find('td, th');
					$(tds[index]).css('display', display);
				})
			});




			function pageSizes()
			{
				$sizeHtml = '<select class="custom-select page-sizes" style="width:auto;" name="'+((settings.pageSizeControlName)? settings.pageSizeControlName : 'page_size')+'"> ';

				if(!settings.pageSizes)
				{
					$sizeHtml += '<option value="5" ' + ((settings.pageSize == 5)? 'selected' : '') + '> 5 </option>';
					$sizeHtml += '<option value="10" '+ ((settings.pageSize == 10)? 'selected' : '') + '> 10 </option>';
					$sizeHtml += '<option value="15" '+ ((settings.pageSize == 15)? 'selected' : '') + '> 15 </option>';
					$sizeHtml += '<option value="25" '+ ((settings.pageSize == 25)? 'selected' : '') + '>25</option>';
					$sizeHtml += '<option value="50" '+ ((settings.pageSize == 50)? 'selected' : '') + '>50</option>';
					$sizeHtml += '<option value="100" '+ ((settings.pageSize == 100)? 'selected' : '') + '>100</option>';
					$sizeHtml += '<option value="250" '+ ((settings.pageSize == 250)? 'selected' : '') + '>250</option>';
				}
				return $sizeHtml+'</select>';
			}

			function setColumnsBinder(){
				let columnBindHtml = '<div class="dropdown">';
				columnBindHtml += '<a class="btn btn-outline-dark dropdown-toggle" href="javascript:;" role="button"> <i class=" fa fa-list"></i></a>';
				columnBindHtml += '<div class="dropdown-content" style="width: 300px;">'; 
				settings.columnInfo.columns.forEach(function(column){
					columnBindHtml += '<label class="dropdown-item-dynamic-table">'+ column.label; 
					columnBindHtml += '<input type="checkbox"'+ ((column.visible !== false) ? 'checked = "checked"': '')+' >';
					columnBindHtml += '<span class="checkmark"></span>';
					columnBindHtml += '</label>';
				});
				columnBindHtml += '</div>';
				columnBindHtml += '</div>';
				return columnBindHtml;
			}



			function toggeleColumn()
			{

			}

			function generatePageLinks()
			{
				var totalPages = Math.ceil(settings.total / settings.pageSize);
				var pageLinks = '';
				var currentPage = settings.page;
				bottomPage = currentPage - settings.pagesEachSide;
				bottomSurplus = (bottomPage < 1) ? (1 - bottomPage) : 0;
				bottomPage = (bottomSurplus) ? 1 : bottomPage;
				upperPage = currentPage + settings.pagesEachSide + bottomSurplus;
				upperSurplus = (totalPages <= upperPage) ? (upperPage - totalPages) : 0;
				// alert(upperSurplus);
				upperPage = (upperSurplus) ? totalPages : upperPage;
				bottomPage = bottomPage - upperSurplus;
				bottomPage = (bottomPage < 1) ? 1 : bottomPage ;			 

				for(i=bottomPage; i <= upperPage; i++)
				{
					pageLinks += '<li class="page-item mr-2 ' + ((settings.page == i) ? 'active' : '') + '"> <a class="page-link rounded-pill" page="'+i+'" style="min-width:37px;" href="javascript:;">' + i + '</a></li>'
				}
				return pageLinks;
			}

			function pagination()
			{
				prev = (settings.page>1) ? true : false;
				next = (settings.page < Math.ceil(settings.total / settings.pageSize)) ? true : false;
				displayInfo = 'No record to display';
				if(settings.total > 0)
				{
					from = (settings.page-1) * settings.pageSize +1;
					to = (settings.page) * settings.pageSize;
					to = (to>settings.total) ? settings.total : to;
					displayInfo = 'Showing ' + from + ' to ' + to + ' of ' + settings.total + ' entries';

				}
				return 	'<nav aria-label="Pagination">' +
							'<ul class="pagination">'+
								'<li class="mr-2" style="line-height:40px">' + displayInfo + '</li>'+
							    '<li class="page-item prev '+ ((!prev)?'disabled':'') +' mr-2">'+
							      '<a class="page-link rounded-circle"  style="width:37px;"  href="javascript:;" aria-label="Previous">' +
							        '<span aria-hidden="true">&laquo;</span>' +
							        '<span class="sr-only">Previous</span>' +
							      '</a>'+
							    '</li>'+
					    	
							    '<li class="page-item next  '+ ((!next)?'disabled':'') +' mr-2">'+
							      '<a class="page-link rounded-circle" style="width:37px;" href="javascript:;" aria-label="Next">' +
							        '<span aria-hidden="true">&raquo;</span>' +
							        '<span class="sr-only">Next</span>' +
							      '</a>' +
							    '</li>' +
							  '</ul>' +
							'</nav>';
			}


			function generateTableHeaders()
			{
				var headingHtml = '<tr>';
				searchRow = false;
			 	settings.columnInfo.columns.forEach(function(obj){
			 		headingHtml += '<th>' + obj.label + '</th>';
			 		if(!searchRow && obj.searchable)
			 		{
			 			searchRow  = true;
			 		} 
			 	});
			 	headingHtml += (settings.columnInfo.actionButtons) ? '<th> Action </th>' : '';
			 	headingHtml += '</tr>';
			 	if(searchRow)
			 	{
			 		headingHtml += '<tr>';
			 		settings.columnInfo.columns.forEach(function(obj){
				 		headingHtml += '<th>';
				 		if(obj.searchable)
				 		{
				 			if(obj.type == 'text' || typeof obj.type == undefined)
				 			{
				 				headingHtml += '<input class="form-control searchable" type="text" name="'+ obj.name +'"/>';
				 			}
				 			else if(obj.type == 'select')
				 			{
				 				headingHtml += '<select class="custom-select">';
				 				headingHtml += '<option value=""></option>';
				 				if(obj.url)
				 				{

				 				}
				 				obj.options.forEach(function(option){
				 					headingHtml += '<option value = "' + option.value + '">' + option.label + '</option>';
				 				});

				 				headingHtml += '</select>';
				 			}
				 			else if(obj.type == 'number')
				 			{
				 				if(obj.range !== false)
				 				{
				 					headingHtml += '<input class="form-control searchable form-control-sm mb-2" type = "number" name = "'+ obj.name + '_from" placeholder = "From"/>';
				 					headingHtml += '<input class="form-control searchable form-control-sm" type = "number" name="'+ obj.name + '_to" placeholder = "To"/>';
				 				}
				 				else
				 				{
				 					headingHtml += '<input class="form-control searchable" type="number" name="'+ obj.name + '"/>';
				 				}
				 			}
				 			else if(obj.type == 'date')
				 			{
				 				if(obj.range !== false)
				 				{
				 					headingHtml += '<input class = "form-control searchable form-control-sm mb-2" type = "date" name = "'+ obj.name + '_from" placeholder = "From"/>';
				 					headingHtml += '<input class = "form-control searchable form-control-sm" type = "date" name = "'+ obj.name + '_to" placeholder = "To"/>';
				 				}
				 				else
				 				{
				 					headingHtml += '<input class = "form-control searchable" type="date" name = "'+ obj.name + '"/>';
				 				}
				 			}
				 		}
				 		headingHtml += '</th>';
				 		 
				 	});
				 	headingHtml += (settings.columnInfo.actionButtons) ? '<th> </th>' : '';
			 		headingHtml += '</tr>';
			 	}
			 	return headingHtml;
			}

			function loadList(tableEl)
			{
				let ajaxSetup = $.ajaxSetup();
				if(typeof ajaxSetup.headers == 'undefined' || typeof ajaxSetup.headers['X-CSRF-TOKEN'] == 'undefined')
				{
					if(!settings.xcsrftoken && !$('meta[name="csrf-token"]').attr('content'))
					{
						console.error('X-CSRF-TOKEN has not been set in ajaxSetup. Nor, xcsrftoken provided in initialization nor defined in meta tag. Please initialize csrftoken in <meta name="csrf-token" content="csrf_token_provided_server"/>');
					}
					else
					{
						$.ajaxSetup({
				            headers: {
				                'X-CSRF-TOKEN': ((settings.xcsrftoken) ? settings.xcsrftoken : $('meta[name="csrf-token"]').attr('content'))
				            }
				        });
					}
						
				}
				
				

				$.ajaxSetup({
		            headers: {
		                'X-CSRF-TOKEN': ((settings.xcsrftoken) ? settings.xcsrftoken : $('meta[name="csrf-token"]').attr('content'))
		            }
		        });
				if(settings.request)
				{
					settings.request.abort();
				}
				data = getSearchParams($('.search-form-'+$(tableEl).attr('id')));
				data['page'] = settings.page;
				if(settings.url)
				{
					settings.request = $.ajax({url:  settings.url,
							method: settings.method,
							data: data,
							dataType: 'json',
							success: function(resObj)
							{
								settings.total = objectMap(resObj, settings.totalItemsKey);
								$(tableEl).parents('.wrapper-for-' + $(tableEl).prop('id')).find('.pagination').parent('nav').remove();
								$(tableEl).parents('.wrapper-for-' + $(tableEl).prop('id')).append(pagination());
								$(tableEl).parents('.wrapper-for-' + $(tableEl).prop('id')).find('.pagination .next').before(generatePageLinks());
								settings.dataItems = objectMap(resObj,settings.dataItemsKey);
								setTableData();
							}
					});
				}
				else
				{
					setTableData();
				}
						
			}

			function getSearchParams(formEl)
			{
				var inputs = $(formEl).find('input, select');
				dataObj = {};
				$(inputs).each(function(inex,obj){
					dataObj[$(obj).prop('name')] = $(obj).val();
				});
				var keys = Object.keys(settings.params);
				keys.forEach(function(key){
					dataObj[key] = settings.params[key];
				});

				return dataObj;
			}

			function setTableData()
			{
				$(tableEl).find('tbody').empty();
				var tableRowsHtml = '';
				settings.dataItems.forEach(function(datum, index){
					tableRowsHtml += '<tr>';
					settings.columnInfo.columns.forEach(function(column){
						if(column.templates)
						{
							tableRowsHtml += '<td class="' + ((column.tdClass) ? column.tdClass : '')+ '">';
							column.templates.forEach(function(tpl){
								expression = tpl.expression;
								conditionVariables = expression.match(templatePatternRegex);
								conditionVariables.forEach(function(cond){
									let condVar = cond.substring(2, cond.length-2);
									expression = expression.replace('::'+condVar+'::','objectMap(datum,\'' + condVar + '\')');
								});

								if(eval(expression))
								{
									if(!tpl.template)
									{
										tableRowsHtml += objectMap(datum,column.name);
									}
									else
									{
										let renderingTempalate = tpl.template;
										let renderings = tpl.template.match(templatePatternRegex);
										renderings.forEach(function(patterenedKey){
											key = patterenedKey.substring(2,patterenedKey.length-2);
											if(key.indexOf('(')<0)
											{
												renderingTempalate = renderingTempalate.replace(patterenedKey,objectMap(datum,key));
											}
											else if(key.indexOf('(') == 0)
											{
												let mappingObject = key.substring(1,key.length-1);
												renderingTempalate = renderingTempalate.replace(patterenedKey,objectMap(column[mappingObject],objectMap(datum,column.name)));
											}
										});
										tableRowsHtml += renderingTempalate;
									}

								}
							});
							tableRowsHtml += '</td>';
						}
						else if(column.template)
						{
							tableRowsHtml += '<td class="' + ((column.tdClass) ? column.tdClass : '')+ '">';
							let renderingTempalate = column.template;
							let renderings = column.template.match(templatePatternRegex);
							renderings.forEach(function(patterenedKey){
								key = patterenedKey.substring(2,patterenedKey.length-2);
								if(key.indexOf('(')<0)
								{
									renderingTempalate = renderingTempalate.replace(patterenedKey,objectMap(datum,key));
								}
								else if(key.indexOf('(') == 0)
								{
									let mappingObject = key.substring(1,key.length-1);
									renderingTempalate = renderingTempalate.replace(patterenedKey,objectMap(column[mappingObject],objectMap(datum,column.name)));
								}
							});
							tableRowsHtml += renderingTempalate;
							tableRowsHtml += '</td>';
						}
						else
						{
							tableRowsHtml += '<td class="' + ((column.tdClass) ? column.tdClass : '')+ '">' + objectMap(datum,column.name) + '</td>';
						}
						
					});
					if(settings.columnInfo.actionButtons)
					{
						tableRowsHtml += '<td>';
						settings.columnInfo.actionButtons.forEach(function(actionBtn){
				 			let renderingTempalate = actionBtn.template;
				 			let renderings = renderingTempalate.match(templatePatternRegex);
				 			if(renderings)
				 			{
								renderings.forEach(function(patterenedKey){
									key = patterenedKey.substring(2,patterenedKey.length-2);
									if(key.indexOf('(')<0)
									{
										renderingTempalate = renderingTempalate.replace(patterenedKey,objectMap(datum,key));
									}
									else if(key.indexOf('(') == 0)
									{
										var mappingObject = key.substring(1,key.length-1);
										renderingTempalate = renderingTempalate.replace(patterenedKey,objectMap(column[mappingObject],objectMap(datum,column.name)));
									}
								});
							}
							tableRowsHtml += renderingTempalate+" &nbsp;";
						});
						tableRowsHtml += '</td>';
				 	}


					tableRowsHtml += '</tr>';
			 	});
			 	$(tableEl).find('tbody').append(tableRowsHtml);
			}

			function objectMap(object,keypattern)
			{
				keypattern = keypattern.toString();
				var returnableValue = object;
				keys = keypattern.split('.');
				keys.forEach(function(key){
					if(returnableValue)
					{
						returnableValue = returnableValue[key];
					}	
				});
				return (returnableValue != null)? returnableValue : '';
			}


		});


			



	}

}(jQuery));