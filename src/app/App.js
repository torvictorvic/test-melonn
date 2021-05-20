import React, { Component } from 'react';

class App extends Component {

    constructor() {
        //Hereda todas las funciones de react
        super();

        this.state = {
            isLoggedIn: true,
            title: '',
            description: '',
            _id: '',
            tasks: [],
            tasksFilter: [],
            user: '',
            pass: '',

            // Melonn 
            melonnShippingMethods: [],
            productsShipping: [0],
            sellerStore: '',
            shippingMethod: '',
            externalOrderNumber: '',
            buyerFullName: '',
            buyerPhoneNumber: '',
            shippingAddress: '',
            shippingCity: '',
            shippingRegion: '',
            shippingCountry: '',
            productsTotalWeight: 0,
        };
        
        this.handleChange = this.handleChange.bind(this);
        this.addTask = this.addTask.bind(this);
        this.postLogin = this.postLogin.bind(this);
        this.handleClickAddProduct = this.handleClickAddProduct.bind(this);

    }

    postLogin(e) {
      e.preventDefault();
      // console.clear()

      this.setState({
        ["isLoggedIn"]: true
      });

    }

    // And and Update
    addTask(e) {
        e.preventDefault();
        
        let data = {}
        let dataProducts = []
        let totalWeight = 0
        
        let productsCount = 0
        for ( let i = 0 ; i < this.state.productsShipping.length ; i++ ) {
          if ( document.getElementById("productName"+i).value === "" || document.getElementById("quantity"+i).value === "" || document.getElementById("productWeight"+i).value === "" )
              productsCount++;
          else {
              let dataProductsi = {}
              dataProductsi.productName = document.getElementById("productName"+i).value
              dataProductsi.quantity = document.getElementById("quantity"+i).value
              dataProductsi.productWeight = document.getElementById("productWeight"+i).value
              totalWeight = parseInt(totalWeight) + parseInt(dataProductsi.productWeight)
              dataProducts.push( dataProductsi )
          }
        }
        
        if ( productsCount > 0 || this.state.sellerStore === "" || this.state.shippingMethod === "" || this.state.externalOrderNumber === "" || this.state.buyerFullName === "" || this.state.buyerPhoneNumber === "" || this.state.shippingAddress === "" || this.state.shippingCity === "" || this.state.shippingRegion === "" || this.state.shippingCountry === "" ) {
          window.M.toast({html: 'Please, Fill all inputs! '});
        } else {
          data.sellerStore = this.state.sellerStore
          data.shippingMethod = this.state.shippingMethod
          data.externalOrderNumber = this.state.externalOrderNumber
          data.buyerFullName = this.state.buyerFullName
          data.buyerPhoneNumber = this.state.buyerPhoneNumber
          data.shippingAddress = this.state.shippingAddress
          data.shippingCity = this.state.shippingCity
          data.shippingRegion = this.state.shippingRegion
          data.shippingCountry = this.state.shippingCountry
          data.products = dataProducts
          data.productsTotalWeight = totalWeight

          let e = document.getElementById("shippingMethod");
          data.shippingMethodText = e.options[e.selectedIndex].text;

          fetch('/api/tasks/addOrder', {
              method: 'POST',
              body: JSON.stringify(data),
              headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json'
              }
          })
          .then(res => res.json())
          .then(data => {
                
                window.M.toast({html: data.status});
                this.fetchTasks();
                document.getElementById('iformOrders').style.display = 'none'
                document.getElementById('ilistOrders').style.display = 'block'
                document.getElementById('idetailOrders').style.display = 'none'
                

           })
           .catch(err => console.error(err));

          // window.M.toast({html: 'Saved Order! ' });
        }

    }
    
    //funcion que se despliega de forma automatica cada vez que se carga la clase
    componentDidMount() {

      console.clear()

      // Call all data
      this.fetchTasks();


      // Melonn Shipping Methods
      this.melonnShippingMethods()
    }

    // Melonn: Return list of Shipping Methods
    melonnShippingMethods() {
      fetch('/api/tasks/melonnShippingMethods')
        .then(res => res.json())
        .then(data => {
          this.setState({melonnShippingMethods: data});
      });
    }

    //Form of Sell order creation
    formOrder() {
        let count = 0;

        return (
        <div className="card" >
          <div className="card-content" >
            <form onSubmit={this.addTask} >
                <div className="row" >
                    <div className="input-field cols12" >
                        <i className="material-icons prefix">account_circle</i>
                        <input name="sellerStore" type='text' placeholder="Seller Store" onChange={this.handleChange} value={this.state.sellerStore} />
                    </div>
                </div>
                <div className="row" >
                    <i className="material-icons prefix">local_shipping</i>
                    <label>Shipping Method</label>
                    <div className="input-field cols 12" >
                        <select id="shippingMethod" name="shippingMethod" className="browser-default" onChange={this.handleChange}>
                          <option value="0" key='0'  selected>Choose your option</option>
                          {
                            this.state.melonnShippingMethods.map(data => {
                              return (
                                <option key={data.id} value={data.id} >{data.name}</option>
                              )
                            })
                          }
                        </select>
                    </div>
                </div>
                <div className="row" >
                    <div className="input-field cols12" >
                        <i className="material-icons prefix">reorder</i>
                        <input name="externalOrderNumber" type='text' placeholder="External Order Number" onChange={this.handleChange} value={this.state.externalOrderNumber} />
                    </div>
                </div>
                <div className="row" >
                    <div className="input-field cols12" >
                        <i className="material-icons prefix">account_circle</i>
                        <input name="buyerFullName" type='text' placeholder="Buyer Full Name" onChange={this.handleChange} value={this.state.buyerFullName} />
                    </div>
                </div>

                <div className="row" >
                    <div className="input-field cols12" >
                        <i className="material-icons prefix">phone</i>
                        <input name="buyerPhoneNumber" type='text' placeholder="Buyer Phone Number" onChange={this.handleChange} value={this.state.buyerPhoneNumber} />
                    </div>
                </div>

                <div className="row" >
                    <div className="input-field cols12" >
                        <i className="material-icons prefix">place</i>
                        <input name="shippingAddress" type='text' placeholder="Shipping Address" onChange={this.handleChange} value={this.state.shippingAddress} />
                    </div>
                </div>

                <div className="row" >
                    <div className="input-field cols12" >
                        <i className="material-icons prefix">map</i>
                        <input name="shippingCity" type='text' placeholder="Shipping City" onChange={this.handleChange} value={this.state.shippingCity} />
                    </div>
                </div>

                <div className="row" >
                    <div className="input-field cols12" >
                        <i className="material-icons prefix">map</i>
                        <input name="shippingRegion" type='text' placeholder="Shipping Region" onChange={this.handleChange} value={this.state.shippingRegion} />
                    </div>
                </div>

                <div className="row" >
                    <div className="input-field cols12" >
                        <i className="material-icons prefix">place</i>
                        <input name="shippingCountry" type='text' placeholder="Shipping Country" onChange={this.handleChange} value={this.state.shippingCountry} />
                    </div>
                </div>
                <div className="row" >
                    <i className="material-icons prefix">shopping_cart</i>

                    <label>
                       Products 
                       ( <a onClick={this.handleClickAddProduct}> + </a> )
                       ( { this.state.productsShipping.length } )
                    </label>
                    <div className="input-field cols 12" >
                          {
                            this.state.productsShipping.map(data => {
                              return (
                                <table>
                                  <tbody>
                                  <tr key="row" >
                                    <td className="row" key={ `pro${data}` }>
                                        <input id={`productName${data}`} 
                                               name={`productName${data}`} 
                                               type='text' placeholder={ `Product ${data+1}` } 
                                               onChange={this.handleChange}  
                                            />
                                    </td>
                                    <td className="row" key={ `Qtypro${data}` }>
                                            <input id={`quantity${data}`} 
                                                   name={`quantity${data}`} 
                                                   type='text' 
                                                   placeholder={ `Quantity ${data+1}` } 
                                                   onChange={this.handleChange} 
                                            />
                                    </td>
                                    <td className="row" key={ `weightPro${data}` }>
                                            <input id={`productWeight${data}`} 
                                                   name={`productWeight${data}`} 
                                                   type='text' placeholder={ `Weight ${data+1}` } 
                                                   onChange={this.handleChange}  
                                            />
                                    </td>
                                  </tr>
                                  </tbody>
                                </table>
                              )
                            })
                          }
                    </div>
                </div>


                <button type='submit' className="btn light-blue darken-4" >
                    Save
                </button>
            </form>
          </div>
        </div> );
    }

    handleClickAddProduct() {
      let next = this.state.productsShipping.length
      this.state.productsShipping.push( next )
      this.setState({productsShipping: this.state.productsShipping})
    }

    // Get each data form element when change
    handleChange(e) {
        //console.log(e.target);
        console.log(e.target.name +" = "+e.target.value);
        const { name , value } = e.target;
        this.setState({
            [name]: value
        });
    }

    // Get All Orders
    fetchTasks() {
        
      fetch('/api/tasks')
        .then(res => res.json())
        .then(data => {
          console.log( JSON.stringify(data) )
          this.setState({tasks: data});
      });

    }

    //List Orders
    listTableData() {
        if ( this.state.tasks.length > 0 ) {

          return (
            <table>
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Seller Store</th>
                <th>Creation Date</th>
                <th>Shipping Method</th>
                <th> </th>
              </tr>
            </thead>
            <tbody>
              { 
                

                this.state.tasks.map(task => {
                  return (
                    <tr key={task.internalOrder}>
                        <td>{task.internalOrder}</td>
                        <td>{task.sellerStore}</td>
                        <td>{task.creationDate}</td>
                        <td>{task.shippingMethodText}</td>
                        <td>
                            <button onClick={() => this.viewDetail(task.internalOrder)} className="btn light-blue darken-4">
                              <i className="material-icons">search</i> 
                            </button>
                        </td>
                    </tr>
                    
                  ) 
                })

                
              }
            </tbody>
            </table>
          );

        }
    }


    // Form Login
    formLogin() {
        return (
            <div style={{width: "500px"}} className="row">
                <div className="col s12 z-depth-6 card-panel teal lighten-2">
                  <img src={'https://uploads-ssl.webflow.com/6006f58a9bc1bb84abf7f9b6/607f2886229e2c2762d97f79_Logo-p-500.png'} style={{width: '50%'}} />
                </div>
                <div className="col s12 z-depth-6 card-panel">
                  <form>
                    <div className="row">
                    </div>
                    <div className="row">
                      <div className="input-field col s12">
                        <i className="material-icons prefix">mail_outline</i>
                        <input className="validate" autoFocus name="user" id="email" type="email" onChange={this.handleChange}  value={this.state.user}/>
                        <label data-error="wrong" data-success="right">Email</label>
                      </div>
                    </div>
                    <div className="row">
                      <div className="input-field col s12">
                        <i className="material-icons prefix">lock_outline</i>
                        <input name="pass" id="password" type="password" onChange={this.handleChange} value={this.state.pass}  />
                        <label >Password</label>
                      </div>
                    </div>
                    
                    <div className="row">
                      <div className="input-field col s12">
                        <a href="#" className="btn waves-effect waves-light col s12" onClick={this.postLogin}>
                          Login
                        </a>
                      </div>
                    </div>

                  </form>
                </div>
            </div>
        )
    }

    addOrderDisplay() {
      this.state.sellerStore = ""
      this.state.shippingMethod = ""
      this.state.externalOrderNumber = ""
      this.state.buyerFullName = ""
      this.state.buyerPhoneNumber = ""
      this.state.shippingAddress = ""
      this.state.shippingCity = ""
      this.state.shippingRegion = ""
      this.state.shippingCountry = ""
      this.state.products = []
      this.state.productsTotalWeight = 0
      this.state.productsShipping = []
      this.state.productsShipping.push(0)

      this.setState({productsShipping: this.state.productsShipping})
      this.setState({sellerStore: ""})
      this.setState({shippingMethod: ""})
      this.setState({externalOrderNumber: ""})
      this.setState({buyerFullName: ""})
      this.setState({buyerPhoneNumber: ""})
      this.setState({shippingAddress: ""})
      this.setState({shippingCity: ""})
      this.setState({shippingRegion: ""})
      this.setState({shippingCountry: ""})
      this.setState({products: []})
      this.setState({productsTotalWeight: 0})
      this.setState({productsShipping: [0]})

      document.getElementById("productName0").value = ""
      document.getElementById("quantity0").value = ""
      document.getElementById("productWeight0").value = ""

      document.getElementById('iformOrders').style.display = 'block'
      document.getElementById('ilistOrders').style.display = 'none'
      document.getElementById('idetailOrders').style.display = 'none'
      
    }

    listOrderDisplay () {

      document.getElementById('iformOrders').style.display = 'none'
      document.getElementById('ilistOrders').style.display = 'block'
      document.getElementById('idetailOrders').style.display = 'none'

    }

    orderDetail() {
        
        if ( this.state.tasksFilter.length !== 0 ) {
          return (
            <div>

            
                    <div className="row" >
                        <div className="col s12" >
                            <h6><b>Internal Order</b></h6>
                            {this.state.tasksFilter[0].internalOrder}
                        </div>  
                    </div>
                
                    <div className="row" >
                        <div className="col s12" >
                            <h6><b>Seller Store</b></h6>
                            {this.state.tasksFilter[0].sellerStore}
                        </div>  
                    </div>
                    <div className="row" >
                        <div className="col s12" >
                            <h6><b>Shipping Method</b></h6>
                            {this.state.tasksFilter[0].shippingMethodText}
                        </div>  
                    </div>
                    <div className="row" >
                        <div className="col s12" >
                            <h6><b>External Order Number</b></h6>
                            {this.state.tasksFilter[0].externalOrderNumber}
                        </div>  
                    </div>
                    <div className="row" >
                        <div className="col s12" >
                            <h6><b>Buyer Full Name</b></h6>
                            {this.state.tasksFilter[0].buyerFullName}
                        </div>  
                    </div>

                    <div className="row" >
                        <div className="col s12" >
                            <h6><b>Buyer Phone Number</b></h6>
                            {this.state.tasksFilter[0].buyerPhoneNumber}
                        </div>  
                    </div>

                    <div className="row" >
                        <div className="col s12" >
                            <h6><b>Shipping Address</b></h6>
                            {this.state.tasksFilter[0].shippingAddress}
                        </div>  
                    </div>

                    <div className="row" >
                        <div className="col s12" >
                            <h6><b>Shipping City</b></h6>
                            {this.state.tasksFilter[0].shippingCity}
                        </div>  
                    </div>

                    <div className="row" >
                        <div className="col s12" >
                            <h6><b>Shipping Region</b></h6>
                            {this.state.tasksFilter[0].shippingRegion}
                        </div>  
                    </div>

                    <div className="row" >
                        <div className="col s12" >
                            <h6><b>Shipping Country</b></h6>
                            {this.state.tasksFilter[0].shippingCountry}
                        </div>  
                    </div>

                    <div className="row" >
                        <div className="col s12" >
                            <h6><b>Shipping Country</b></h6>
                            {this.state.tasksFilter[0].shippingCountry}
                        </div>  
                    </div>


                    <div className="row" >
                        <div className="col s12" >
                            <h6><b>Promise</b></h6>
                            <h6>Pack Promise Min</h6> {this.state.tasksFilter[0].promise.packPromiseMin}
                        </div>  
                    </div>
                    <div className="row" >
                        <div className="col s12" >
                            <h6>Pack Promise Max</h6> {this.state.tasksFilter[0].promise.packPromiseMax}
                        </div>  
                    </div>
                    <div className="row" >
                        <div className="col s12" >
                            <h6>Ship Promise Min</h6> {this.state.tasksFilter[0].promise.shipPromiseMin}
                        </div>  
                    </div>
                    <div className="row" >
                        <div className="col s12" >
                            <h6>Ship Promise Max</h6> {this.state.tasksFilter[0].promise.shipPromiseMax}
                        </div>  
                    </div>
                    <div className="row" >
                        <div className="col s12" >
                            <h6>Delivery Promise Min</h6> {this.state.tasksFilter[0].promise.deliveryPromiseMin}
                        </div>  
                    </div>                    
                    <div className="row" >
                        <div className="col s12" >
                            <h6>Delivery Promise Max</h6> {this.state.tasksFilter[0].promise.deliveryPromiseMax}
                        </div>  
                    </div>
                    <div className="row" >
                        <div className="col s12" >
                            <h6>Ready Pickup Promise Min</h6> {this.state.tasksFilter[0].promise.readyPickupPromiseMin}
                        </div>  
                    </div>
                    <div className="row" >
                        <div className="col s12" >
                            <h6>Ready Pickup Promise Max</h6> {this.state.tasksFilter[0].promise.readyPickupPromiseMax}
                        </div>  
                    </div>
                    <div className="row" >
                        <div className="col s12" >
                            <h6>Ready Pick Promise Min</h6> {this.state.tasksFilter[0].promise.readyPickPromiseMin}
                        </div>  
                    </div>
                    <div className="row" >
                        <div className="col s12" >
                            <h6>Ready Pick Promise Max</h6> {this.state.tasksFilter[0].promise.readyPickPromiseMax}
                        </div>  
                    </div>

                    

                    <div className="row" >
                        <div className="col s12" >
                            <h6><b>Products List</b></h6>
                        </div>  
                    </div>
                    <table>
                    <tbody>
                            <tr key="1">
                                <td>Product Nane</td>
                                <td>Product Quantity</td>
                                <td>Product Weight</td>
                            </tr>
                    { 

                        this.state.tasksFilter[0].products.map(task => {
                          return (
                            <tr key={task.productName}>
                                <td>{task.productName}</td>
                                <td>{task.quantity}</td>
                                <td>{task.productWeight}</td>
                            </tr>
                          )
                        })
                    }
                    </tbody>
                    </table>
                    


                    

            </div>
          )    
        }

        

      
    }

    viewDetail(internalOrder) {
      let dataFilter = this.state.tasks.filter(datai => datai.internalOrder === internalOrder);
      this.setState({tasksFilter: dataFilter});
      this.orderDetail()
      document.getElementById('idetailOrders').style.display = 'block'
      document.getElementById('iformOrders').style.display = 'none'
      document.getElementById('ilistOrders').style.display = 'none'     
    }

    // Form Dashboard
    formDashboard() {
        return (
            <div>
                <nav className="light-blue darken-4"> 
                    <div className="container" >
                        <a className="brand-logo" href="/">
                            <img src={'https://uploads-ssl.webflow.com/6006f58a9bc1bb84abf7f9b6/607f2886229e2c2762d97f79_Logo-p-500.png'} style={{width: '18%'}} />
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;  
                            Order Manager
                        </a>
                    </div>
                </nav>

                <div className="container" >
                    <div className="row" >
                        <div className="col s8" id='iformOrders'>
                            <h4>Add Order</h4>
                            {this.formOrder()}
                        </div>

                        <div className="col s10" id='ilistOrders' style={{display: 'none'}} >
                           <h4>
                             List Orders 
                             &nbsp;&nbsp;
                             <button onClick={() => this.addOrderDisplay()} className="btn light-blue darken-4">
                               <i className="material-icons">add</i> 
                              </button>
                           </h4>
                           {this.listTableData()} 
                        </div>

                        <div className="col s10" id='idetailOrders' style={{display: 'none'}} >
                            <h4>Order Detail</h4>
                            &nbsp;&nbsp;
                             <button onClick={() => this.addOrderDisplay()} className="btn light-blue darken-4">
                               <i className="material-icons">add</i> 
                              </button>
                              <button onClick={() => this.listOrderDisplay()} className="btn light-blue darken-4">
                               <i className="material-icons">search</i> 
                              </button>
                            {this.orderDetail()}
                        </div>

                    </div>
                </div>

                 
                <div id="modal1" className="modal">
                    <div className="modal-content">
                      <h4>Order Detail</h4>
                      ... ... ... ... ... ... ... ... ... ... ... 
                    </div>
                    <div className="modal-footer">
                      <a href="#!" className="modal-close waves-effect waves-green btn-flat">Close</a>
                    </div>
                </div>

                

            </div>
          )
    }

    //Render Main App React
    render() {

        let form; 

        // console.clear()
        

        if (this.state.isLoggedIn === false) {
          form = this.formLogin()
        } else {
          form = this.formDashboard()
        }

        return( 
            <div>
            {form} 
            </div>
        )
    }


}

export default App;
