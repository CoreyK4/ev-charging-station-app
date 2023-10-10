function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);

    React.useEffect(() => {
        if (localStorage.getItem('user_id')) {
            setIsLoggedIn(true);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user_id');
        setIsLoggedIn(false);
    };

    return (
        <>
            <nav className="offcanvas offcanvas-start offcanvas-size-sm" tabIndex="-1" id="mainNavigation"
                aria-labelledby="mainNavigationLabel">
                <div className="offcanvas-header border-2 border-bottom">
                    <h5 className="offcanvas-title" id="mainNavigationLabel"><ReactRouterDOM.Link to="/">EV Charge Map</ReactRouterDOM.Link></h5>
                    <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div className="offcanvas-body">
                    <div className="list-group list-group-flush border-bottom d-flex flex-column h-100">
                        {!isLoggedIn ? <><a className="list-group-item list-group-item-action py-3 lh-tight border-bottom" data-bs-toggle="modal" data-bs-target="#registerModal">Register</a><a className="list-group-item list-group-item-action py-3 lh-tight border-bottom" data-bs-toggle="modal" data-bs-target="#loginModal">Log In</a></> : null}
                        {isLoggedIn ? <a href="/#/favorites" className="list-group-item list-group-item-action py-3 lh-tight border-bottom">Favorites</a> : null}
                        {isLoggedIn ? <a className="list-group-item list-group-item-action py-3 lh-tight border-bottom mt-auto" onClick={handleLogout}>Logout</a> : null}
                    </div>
                </div>
            </nav>
        </>
    )
}

function Sidebar(props) {
    const [isLoggedIn, setIsLoggedIn] = React.useState(false);
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
                    user_id: Number(localStorage.getItem('user_id'))
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
    }, []);

    React.useEffect(() => {
        const checkLoginStatus = () => {
            setIsLoggedIn(!!localStorage.getItem('user_id'));
        };

        checkLoginStatus();

        window.addEventListener('storage', checkLoginStatus);

        return () => {
            window.removeEventListener('storage', checkLoginStatus);
        };
    }, []);

    function addFavorite(id, lat, lng) {

        const favoriteData = {
            user_id: Number(localStorage.getItem('user_id')),
            ocm_poi_id: id,
            latitude: lat,
            longitude: lng
        }

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
                    delay: 2500
                });
                toast.show();
                setFavorites([...favorites, { id, lat, lng }]);
            })
    };

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
                            <a key={key} onClick={() => zoomToMarker(key)} className="list-group-item list-group-item-action py-3 lh-tight">
                                <div className="d-flex w-100 align-items-center justify-content-between">
                                    <ReactRouterDOM.Link key={props.markers[key].id} to={`/charger_details/${props.markers[key].id}`}><strong className="mb-1">{props.markers[key].title}</strong></ReactRouterDOM.Link>
                                    {isLoggedIn ?
                                        <i
                                            style={{ fontSize: "2rem", color: "gold", cursor: "pointer" }}
                                            className={`bi ${isFavorite ? 'bi-bookmark-star-fill' : 'bi-bookmark-star'} addFavorite`}
                                            onClick={() => addFavorite(props.markers[key].id, props.markers[key].lat, props.markers[key].lng)}
                                        >
                                        </i>
                                        : null}
                                </div>
                                <div className="d-flex w-100 align-items-center justify-content-between">
                                    <div className="col-10 mb-1 small sidebarAddress"><p>{props.markers[key].addressLine1}</p><p>{props.markers[key].town}, {props.markers[key].stateOrProvince} {props.markers[key].postcode}</p></div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            </div>
            <div className="toast-container position-fixed top-0 start-50 translate-middle-x p-3">
                <div id="liveToast" className="toast hide" role="alert" aria-live="assertive" aria-atomic="true">
                    <div className="toast-header">
                        <strong className="me-auto">Notification</strong>
                        <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                    </div>
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

        return (
            <div className="d-flex flex-column align-items-stretch flex-shrink-0 bg-white vh-100">
                <div className="d-flex align-items-center flex-shrink-0 p-3 link-dark text-decoration-none border-bottom position-sticky">
                    <span className="fs-3 fw-semibold">{details?.AddressInfo?.Title}</span>
                </div>
                <div className="card rounded-0">
                    <div className="card-header fs-5 fw-semibold">
                        Location Details
                    </div>
                    <div className="card-body">
                        <h5 className="card-title fs-6">Address</h5>
                        <p className="card-text">{details?.AddressInfo?.AddressLine1}<br />{details?.AddressInfo?.Town}, {details?.AddressInfo?.StateOrProvince} {details?.AddressInfo?.Postcode}</p>
                    </div>
                </div>
            </div>
        );
}

function Favorites() {
    const [favorites, setFavorites] = React.useState([]);

    React.useEffect(() => {
        async function fetchFavorites() {
            if (localStorage.getItem('user_id')) {
                const userData = {
                    user_id: Number(localStorage.getItem('user_id'))
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
    }, []);

    if (localStorage.getItem('user_id')) {
        return (
            <div className="d-flex flex-column align-items-stretch flex-shrink-0 bg-white vh-100">
                <div className="d-flex align-items-center flex-shrink-0 p-3 link-dark text-decoration-none border-bottom position-sticky">
                    <span className="fs-5 fw-semibold">Favorites</span>
                </div>
                <div className="list-group list-group-flush border-bottom overflow-y-scroll scrollarea">
                    {favorites.map(favorite => (
                        <ReactRouterDOM.Link key={favorite.id} to={`/charger_details/${favorite.id}`}><div className="list-group-item list-group-item-action py-3 lh-tight">
                            <div className="d-flex w-100 align-items-center justify-content-between">
                                <strong className="mb-1">{favorite.title}</strong>
                                <i className="las la-charging-station la-3x"></i>
                            </div>
                            <div className="d-flex w-100 align-items-center justify-content-between">
                                <div className="col-10 mb-1 small sidebarAddress"><p>{favorite.addressLine1}</p><p>{favorite.town}, {favorite.stateOrProvince} {favorite.postcode}</p></div>
                                {/* {localStorage.getItem('user_id') ? <i className="las la-heart la-2x addFavorite" onClick={() => addFavorite(props.markers[key].id, props.markers[key].lat, props.markers[key].lng)}></i> : null} */}
                            </div>
                        </div></ReactRouterDOM.Link>
                    ))}
                </div>
            </div>
        );
    } else {
        return (
            <div className="d-flex flex-column align-items-stretch flex-shrink-0 bg-white vh-100">
                <div className="d-flex align-items-center flex-shrink-0 p-3 link-dark text-decoration-none border-bottom position-sticky">
                    <span className="fs-5 fw-semibold">Favorites</span>
                </div>
                <div className="list-group list-group-flush border-bottom overflow-y-scroll scrollarea">
                    <p>You must be logged in to view your favorites!</p>
                </div>
            </div>
        );
    }
}


const container = document.getElementById('sidebar');
const root = ReactDOM.createRoot(container);
root.render(
    <ReactRouterDOM.HashRouter>
        <Navbar />
        <ReactRouterDOM.Route exact path="/">
            <Sidebar markers={markers} />
        </ReactRouterDOM.Route>
        <ReactRouterDOM.Route exact path="/favorites">
            <Favorites />
        </ReactRouterDOM.Route>
        <ReactRouterDOM.Route exact path="/charger_details/:id" component={ChargerDetails}>
        </ReactRouterDOM.Route>
    </ReactRouterDOM.HashRouter>
);