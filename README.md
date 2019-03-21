# dynamic-table
JQuery Plugin for dynamic table - designing based on bootstrap4
# General Overview -
I am great admirer of datatable. I used it for long time and feel something can be improved in it - specifically, when it comes to work with dynamic contents recieving from server, search on specific columns, search in range, changing the representation of data (column) in table.

This plugin has been developed to synchronize data with server, search on specific columns and rendering as easy as possilbe. It will not look in client side to search. This allows you to set range serach. To work with this you just need to know how to write JSON object in javascript and initialize the jQuery plugin.

# Example based on https://gorest.co.in/
Lets start with api returned by https://gorest.co.in/public-api/users?_format=json&access-token=IHV_k_ry6RjB1Pns90WDZKKGVih42hXSeEp2

# html for table

    <table id="dynamicTable">
    </table> 
    
# json object that shoud be created to initialize the table
**template key** has been used to custom rendering,  **::key_name** will be replaced with the dynamic value in api and **::(object_name)::** will map the current column value to that object.

    columnInfo	={
					   columns:
					   [
                            {   name : 'name',
                                type: 'text',
                                label:'Name',
                                template: '<img src="::_links.avatar.href::" style="width: 60px; border-radius: 50%;"/> ::name::',
                                searchable: true
                            },
                            {   name : 'gender',
                                type: 'text',
                                label:'Gender',
                                searchable: true
                            },
                            {   name : 'dob',
                                type: 'text',
                                label:'DOB',
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
                                name: 'address',
                                type: 'text',
                                label: 'Address',
                                searchable: true,
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
                            template: '<a title = "Click to edit this record" href="{{request()->root()}}/admin/user/edit/::id::"> <i class = "fa fa-edit"></i> Edit</a>'
                        },
                        {
                            template: '<a title="Click to delete this record" href="javascript:;"> <i class = "fa fa-trash-o"></i> Delete</a>'
                        }
                    ]
                }; 
