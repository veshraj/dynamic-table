# dynamic-table
JQuery Plugin for dynamic table - designing based on bootstrap4
## 1. General Overview -
I am great admirer of datatable. I used it for long time and feel something can be improved in it - specifically, when it comes to work with dynamic contents recieving from server, search on specific columns, search in range, changing the representation of data (column) in table.

This plugin has been developed to synchronize data with server, search on specific columns and rendering as easy as possilbe. It will not look in client side to search. This allows you to set range serach. To work with this you just need to know how to write JSON object in javascript and initialize the jQuery plugin.

## 2. Example based on https://gorest.co.in/
Lets start with api returned by https://gorest.co.in/public-api/users?_format=json&access-token=IHV_k_ry6RjB1Pns90WDZKKGVih42hXSeEp2

### 2.1 html for table

    <table id="dynamicTable">
    </table> 
    
### 2.2 json object that shoud be created to initialize the table
**template key** has been used to custom rendering,  **::key_name** will be replaced with the dynamic value in api and **::(object_name)::** will map the current column value to that object.
Following json object is the structure for columns (name, email, status, website) and an action button.

    columnInfo	= {
			columns:
			[
                            {   name : 'name',
                                type: 'text',
                                label:'Name',
                                template: '<img src="::_links.avatar.href::" style="width: 60px; border-radius: 50%;"/> ::name::',
                                searchable: true
                            },
                            {
                                name: 'email',
                                type: 'text',
                                label: 'Email',
                                searchable: true
                            },
                            {
                                name: 'status',
                                label: 'Status',
                                badgeClasses: {
                                    'active':'badge-success',
                                    'inactive': 'badge-danger'
                                },
                                template : '<a class="change-status" href="javascript:;" id="::id::"> <span class="badge ::(badgeClasses)::">::status::</span></a>',
                                tdClass: 'text-center',
                            },
                            {
                                name: 'website',
                                type: 'text',
                                label: 'Website',
                                template: '<a href="::website::" target="_blank">::website::</a>',
                                searchable: true,
                            }
                    ],
                    actionButtons : 
                    [
                        {
                            <a title = "Click to edit this record" href="::_links.self.href::"> <i class = "fa fa-eye"></i> View</a>
                        }
                    ]
                }; 
### 2.3 initialize the table with jQuery plugin
    
    $('#dynamicTable').dynamicTable({
        // custom table that you want to apply on table 
        class: 'table-bordered table-striped',
	   // api from where you want to fetch data formm
	   url: 'https://gorest.co.in/public-api/users',
	   // method used to call api
	   method : 'GET',
	   // key in api that give information of total items
	   totalItemsKey: '_meta.totalCount',
	   // key in api which hold the items that need to shown
	   dataItemsKey: 'result',
	   // column info that is given
	   columnInfo: columnInfo,
	   // default parameters that you want to send along with api call
	   params: {'_format': 'json',
		   'access-token': 'IHV_k_ry6RjB1Pns90WDZKKGVih42hXSeEp2'
	   }
    });
    
 ### 2.4 Output screen shot of above example
![Screen Shot 2019-03-21 at 10 39 47 PM](https://user-images.githubusercontent.com/4266975/54769947-6185b200-4c2a-11e9-9ce2-d4cd81297fd1.png)

## 3. Column options
 Following structure has possible options to a column
 
 	{  
	    // @string type
	      name : 'key_in_api @String',
	    // @string type text/number/date are supproted for now
            type: 'type_of_input_to_show',
	    // @string
            label: 'Caption Displayed on Head of the column',
	    // @boolean
            searchable: 'flag_for_whether_column_will_be_searchable_or_not',
	    // @integer
	    max: 'maximun_number_of_text_displayed @integer',
	    // @string but in html
	    template: '<a href="::website::" target="_blank">::website::</a>',
	    // @array of objects
            tetemplates: [{
	    		    // @string formatted which will be converted to condtion
                             expression: '(::customer_id::)',
			     // no template display jsut value there
                          },
                          {
                              expression: '(!::customer_id::)',
                              template: '<a class="btn assign-customer-id btn-primary btn-sm text-light" subscriber-id="::id::"> <i class = "fa fa-plus"></i> Customer Id</a>'
                           }
             ]
	    
        },

