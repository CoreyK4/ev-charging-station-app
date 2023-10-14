function App() {
  const [isLoggedIn, setIsLoggedIn] = React.useState(!!localStorage.getItem('user_id'));

  // Function to handle login status change
  const handleLoginStatusChange = () => {
    setIsLoggedIn(!!localStorage.getItem('user_id'));
  };

  const showToast = (message) => {
    const toastEl = document.getElementById('liveToast');
    const toastBodyEl = toastEl.querySelector('.toast-body');
    toastBodyEl.textContent = message;
  
    const toast = new bootstrap.Toast(toastEl, {
      delay: 2500,
    });
    toast.show();
  };

  React.useEffect(() => {
    // Listen for changes in localStorage
    window.addEventListener('storage', handleLoginStatusChange);

    return () => {
      // Remove the event listener when the component unmounts
      window.removeEventListener('storage', handleLoginStatusChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    setIsLoggedIn(false);
    showToast("You have successfully logged out!");
  };

  return (
    <ReactRouterDOM.BrowserRouter>
      <Navbar isLoggedIn={isLoggedIn} handleLogout={handleLogout} />
      <ReactRouterDOM.Route exact path="/">
        <Sidebar markers={markers} isLoggedIn={isLoggedIn} />
      </ReactRouterDOM.Route>
      <ReactRouterDOM.Route exact path="/favorites">
        <Favorites isLoggedIn={isLoggedIn} />
      </ReactRouterDOM.Route>
      <ReactRouterDOM.Route exact path="/charger_details/:id" component={ChargerDetails} />
    </ReactRouterDOM.BrowserRouter>
  );
}

function Navbar({ isLoggedIn, handleLogout }) {
  let bsOffcanvas;

  React.useEffect(() => {
    // Create the Offcanvas instance when the component mounts
    bsOffcanvas = new bootstrap.Offcanvas('#mainNavigation');
  }, [isLoggedIn]);

  const closeOffcanvas = () => {
    // Check if the Offcanvas instance exists and hide it
    if (bsOffcanvas) {
      bsOffcanvas.hide();
    }
  };
  return (
    <>
      <nav
        className="offcanvas offcanvas-start offcanvas-size-sm"
        tabIndex="-1"
        id="mainNavigation"
        aria-labelledby="mainNavigationLabel"
      >
        <div className="offcanvas-header border-2 border-bottom">
          <h5 className="offcanvas-title" id="mainNavigationLabel">
            <ReactRouterDOM.Link to="/" onClick={closeOffcanvas}>EV Charge Map</ReactRouterDOM.Link>
          </h5>
          <button
            type="button"
            className="btn-close text-reset"
            onClick={closeOffcanvas}
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <div className="list-group list-group-flush border-bottom d-flex flex-column h-100">
            {!isLoggedIn ? (
              <>
                <a
                  className="list-group-item list-group-item-action py-3 lh-tight border-bottom"
                  data-bs-toggle="modal"
                  data-bs-target="#registerModal"
                  onClick={closeOffcanvas}
                >
                  Register
                </a>
                <a
                  className="list-group-item list-group-item-action py-3 lh-tight border-bottom"
                  data-bs-toggle="modal"
                  data-bs-target="#loginModal"
                  onClick={closeOffcanvas}
                >
                  Log In
                </a>
              </>
            ) : null}
            {isLoggedIn ? (
              <ReactRouterDOM.Link to="/favorites" onClick={closeOffcanvas} className="list-group-item list-group-item-action py-3 lh-tight border-bottom">
                Favorites
              </ReactRouterDOM.Link>
            ) : null}
            {isLoggedIn ? (
              <a
                className="list-group-item list-group-item-action py-3 lh-tight border-bottom mt-auto"
                onClick={() => {
                  handleLogout();
                  closeOffcanvas();
                }}
              >
                Logout
              </a>
            ) : null}
          </div>
        </div>
      </nav>
    </>
  );
}

function Sidebar(props) {
  const [renderCount, setRenderCount] = React.useState(0);
  const [favorites, setFavorites] = React.useState([]);

  React.useEffect(() => {
    function handleMarkersUpdate() {
      // Force a re-render by changing the state
      setRenderCount(prevCount => prevCount + 1);
    }

    // Listen for the custom event emitted from addMarkers() in JS
    document.addEventListener('markersUpdated', handleMarkersUpdate);

    // Cleanup
    return () => {
      document.removeEventListener('markersUpdated', handleMarkersUpdate);
    };
  }, []);

  React.useEffect(() => {
    async function fetchFavorites() {
      if (localStorage.getItem('user_id')) {
        const userData = {
          user_id: Number(localStorage.getItem('user_id')),
        };

        const response = await fetch('/get_favorites', {
          method: 'POST',
          body: JSON.stringify(userData),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const results = await response.json();
        setFavorites(results.favorites);
      }
    }

    fetchFavorites();
  }, [props.isLoggedIn]);

  function addFavorite(id, lat, lng) {
    const favoriteData = {
      user_id: Number(localStorage.getItem('user_id')),
      ocm_poi_id: id,
      latitude: lat,
      longitude: lng,
    };

    fetch('/add_favorite', {
      method: 'POST',
      body: JSON.stringify(favoriteData),
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => response.json())
      .then(result => {
        const toastEl = document.getElementById('liveToast');
        const toastBodyEl = toastEl.querySelector('.toast-body');
        toastBodyEl.textContent = result.message;

        const toast = new bootstrap.Toast(toastEl, {
          delay: 2500,
        });
        toast.show();
        setFavorites([...favorites, { id, lat, lng }]);
      });
  }

  return (
    <>
      <div className="d-flex flex-column align-items-stretch flex-shrink-0 bg-white vh-100">
        <div className="d-flex align-items-center flex-shrink-0 p-3 link-dark text-decoration-none border-bottom position-sticky">
          <span className="fs-5 fw-semibold">Charger List</span>
        </div>
        <div className="list-group list-group-flush border-bottom overflow-y-scroll scrollarea">
          {Object.keys(props.markers).map(key => {
            const isFavorite = favorites.some(fav => fav.id === props.markers[key].id);
            return (
              <div key={key} className="list-group-item list-group-item-action py-3 lh-tight">
                <div className="d-flex w-100 align-items-center justify-content-between">
                  <ReactRouterDOM.Link key={props.markers[key].id} onClick={() => zoomToMarker(key)} to={`/charger_details/${props.markers[key].id}`}>
                    <strong className="mb-1">{props.markers[key].title}</strong>
                  </ReactRouterDOM.Link>
                  {props.isLoggedIn ? (
                    <i
                      style={{ fontSize: "2rem", color: "gold", cursor: "pointer" }}
                      className={`bi ${isFavorite ? 'bi-bookmark-star-fill' : 'bi-bookmark-star'} addFavorite`}
                      onClick={() => addFavorite(props.markers[key].id, props.markers[key].lat, props.markers[key].lng)}
                    >
                    </i>
                  ) : null}
                </div>
                <div className="d-flex w-100 align-items-center justify-content-between">
                  <div className="col-10 mb-1 small sidebarAddress"><p>{props.markers[key].addressLine1}</p><p>{props.markers[key].town}, {props.markers[key].stateOrProvince} {props.markers[key].postcode}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="toast-container position-fixed top-0 start-50 translate-middle-x p-3">
        <div id="liveToast" className="toast hide feedback-toast" role="alert" aria-live="assertive" aria-atomic="true">
          <div className="toast-body"></div>
        </div>
      </div>
    </>
  );
}

function ChargerDetails({ match }) {
  const [details, setDetails] = React.useState({});
  const { id } = match.params;

  React.useEffect(() => {
    async function fetchDetails(id) {
      const chargerData = {
        charger_id: id
      };

      const response = await fetch('/api/fetch_charger_by_id', {
        method: 'POST',
        body: JSON.stringify(chargerData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const results = await response.json();
      setDetails(results);
    }

    fetchDetails(id);
  }, []);

  const history = ReactRouterDOM.useHistory();

  const goBack = () => {
    history.goBack();
  };

  function getIconFilename(connectionTypeID) {
    switch (connectionTypeID) {
      case 1:  // Type 1 (J1772)
        return "j1772_type1";
      case 2:  // CHAdeMO
        return "chademo";
      case 25:  // Type 2 (Mennekes)
        return "mennekes_type2";
      case 27:  // Supercharger
      case 30:
        return "supercharger";
      case 32:  // CCS (Type 1)
        return "ccs_type1";
      case 33:  // CCS (Type 2)
        return "ccs_type2";
      case 1040:  // GBT
        return "gbt";
      default:
        return "supercharger";  // Default value if no match is found
    }
  }


  return (
    <div className="d-flex flex-column align-items-stretch flex-shrink-0 bg-white vh-100 charger-details-container">
      <div className="d-flex align-items-center flex-shrink-0 p-3 link-dark text-decoration-none border-bottom position-sticky">
        <button onClick={goBack} className="back-button">
          <i className="bi bi-arrow-left"></i>
        </button>
        <span className="fs-3 fw-semibold">{details?.AddressInfo?.Title}</span>
      </div>
      <div className="overflow-y-scroll scrollarea">
        <div className="card rounded-0">
          <div className="card-header fs-5 fw-semibold">
            Location Details
          </div>
          <div className="card-body">
            <div className="location-details-left">
              <h5 className="card-title fs-6 bold-text">Nearest Address</h5>
              <p className="card-text">
                {details?.AddressInfo?.AddressLine1}<br />
                {details?.AddressInfo?.Town}, {details?.AddressInfo?.StateOrProvince} {details?.AddressInfo?.Postcode}<br /><br />
                <strong>Lat/Long:</strong> {details?.AddressInfo?.Latitude} , {details?.AddressInfo?.Longitude}
              </p>
            </div>
            <div className="location-details-right">
              <p className="card-text">
                {details?.AddressInfo?.AccessComments?.split('; ').map((item, index) => (
                  <div key={index}>{item}</div>
                ))}<br />
                {details?.AddressInfo?.ContactTelephone1}<br />
                <a href={details?.AddressInfo?.RelatedURL}>{details?.AddressInfo?.RelatedURL}</a>
              </p>
            </div>
            <div style={{ clear: "both" }}></div> {/* To clear floats */}
          </div>
        </div>
        <div className="card rounded-0">
          <div className="card-header fs-5 fw-semibold">
            Equipment Details
          </div>
          <div className="card-body">
            {details?.Connections?.map((conn, index) => (
              <div key={index}>
                {/* Display the appropriate image based on the connection type */}
                <img
                  src={`/static/img/connections/${getIconFilename(conn?.ConnectionTypeID)}.png`}
                  alt={conn?.ConnectionType?.Title}
                  className="connection-icon"
                />
                <span className="quantity-box">{conn.Quantity} x</span>
                {conn?.ConnectionType?.FormalName}<br />
                {conn.PowerKW} kW<br />
                {conn?.CurrentType?.Description}<br />
                {conn.Amps}A {conn.Voltage}V<br />
              </div>
            ))}
          </div>
        </div>
        <div className="card rounded-0">
          <div className="card-header fs-5 fw-semibold">
            Usage Restrictions
          </div>
          <div className="card-body">
            <p><span className="bold-text">Usage:</span> {details?.UsageType?.Title}</p>
          </div>
        </div>
        <div className="card rounded-0">
          <div className="card-header fs-5 fw-semibold">
            Network/Operator
          </div>
          <div className="card-body">
            <p className="bold-text">{details?.OperatorInfo?.Title}</p>
            <a href={details?.OperatorInfo?.WebsiteURL}>{details?.OperatorInfo?.WebsiteURL}</a>
          </div>
        </div>
        <div className="card rounded-0">
          <div className="card-header fs-5 fw-semibold">
            Additional Information
          </div>
          <div className="card-body">
            <p className="bold-text">Data Provider</p>
            <p>{details?.DataProvider?.Title}</p>
            <a href={details?.DataProvider?.WebsiteURL}>{details?.DataProvider?.WebsiteURL}</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Favorites({ isLoggedIn }) {
  const [favorites, setFavorites] = React.useState([]);

  React.useEffect(() => {
    async function fetchFavorites() {
      if (isLoggedIn) { // Check if the user is logged in
        const userData = {
          user_id: Number(localStorage.getItem('user_id')),
        };

        const response = await fetch('/get_favorites', {
          method: 'POST',
          body: JSON.stringify(userData),
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const results = await response.json();
        setFavorites(results.favorites);
      }
    }

    fetchFavorites();
  }, [isLoggedIn]); // Add isLoggedIn as a dependency to trigger the effect when it changes

  return (
    <div className="d-flex flex-column align-items-stretch flex-shrink-0 bg-white vh-100">
      <div className="d-flex align-items-center flex-shrink-0 p-3 link-dark text-decoration-none border-bottom position-sticky">
        <span className="fs-5 fw-semibold">Favorites</span>
      </div>
      <div className="list-group list-group-flush border-bottom overflow-y-scroll scrollarea">
        {isLoggedIn ? (
          favorites.map(favorite => (
            <div className="list-group-item list-group-item-action py-3 lh-tight">
              <div className="d-flex w-100 align-items-center justify-content-between">
                <ReactRouterDOM.Link key={favorite.id} to={`/charger_details/${favorite.id}`}><strong className="mb-1">{favorite.title}</strong></ReactRouterDOM.Link>
                <i className="las la-charging-station la-3x"></i>
              </div>
              <div className="d-flex w-100 align-items-center justify-content-between">
                <div className="col-10 mb-1 small sidebarAddress">
                  <p>{favorite.addressLine1}</p>
                  <p>{favorite.town}, {favorite.stateOrProvince} {favorite.postcode}</p>
                </div>
              </div>
            </div>

          ))
        ) : (
          <div className="list-group-item list-group-item-action py-3 lh-tight">
            <p>You must be logged in to view your favorites!</p>
          </div>
        )}
      </div>
    </div>
  );
}


// Render the App component
const container = document.getElementById('sidebar');
const root = ReactDOM.createRoot(container);
root.render(<App />);