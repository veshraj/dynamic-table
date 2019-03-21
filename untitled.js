var settings = $.extends({
			url: null,
			method: 'POST',
			pageSizes: null,
			pageSizeControlName: null,
			class : null,
			pageSize: 10,
			columnInfo: []

		},configs);

		return this.each(function(){
			$(this).html('<thead><tr></tr></thead><tbody></tbody>');
			$(this).addClass('table');
			$(this).addClass(settings.class);
			$(this).wrap('<form class="search-form-'+$(this).attr('id')+'">'+
							'</form>');
			$(this).parent().wrap('<div class="wrapper-'+$(this).attr('id')+'"></div>');
		});


		function getSizes(sizes){
			$sizeHtml = '<option class="custom-select" name="'+((settings.pageSizeControlName)? settings.pageSizeControlName : 'page_size')+'"> '
			if(!sizes)
			{

			}

		}