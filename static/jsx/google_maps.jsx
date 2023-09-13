function Navbar() {
    return (
        <>
            <nav className="offcanvas offcanvas-start offcanvas-size-sm" tabIndex="-1" id="mainNavigation"
                aria-labelledby="mainNavigationLabel">
                <div className="offcanvas-header border-2 border-bottom">
                    <h5 className="offcanvas-title" id="mainNavigationLabel">EV Charge Map</h5>
                    <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div className="offcanvas-body">
                    <div className="list-group list-group-flush border-bottom">
                        {localStorage.getItem('user_id') ? null : <><a className="list-group-item list-group-item-action py-3 lh-tight border-bottom" data-bs-toggle="modal" data-bs-target="#registerModal">Register</a><a className="list-group-item list-group-item-action py-3 lh-tight border-bottom" data-bs-toggle="modal" data-bs-target="#loginModal">Log In</a></>}
                        {localStorage.getItem('user_id') ? <a href="/#/favorites" className="list-group-item list-group-item-action py-3 lh-tight border-bottom">Favorites</a> : null}
                        <a className="list-group-item list-group-item-action py-3 lh-tight border-bottom">Link 4</a>
                        <a className="list-group-item list-group-item-action py-3 lh-tight border-bottom">Link 5</a>
                    </div>
                    <div>
                        Some text as placeholder. In real life you can have the elements you have chosen. Like, text, images, lists,
                        etc.
                    </div>
                    <div className="dropdown mt-3">
                        <button className="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton"
                            data-bs-toggle="dropdown">
                            Dropdown button
                        </button>
                        <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                            <li><a className="dropdown-item" href="#">Action</a></li>
                            <li><a className="dropdown-item" href="#">Another action</a></li>
                            <li><a className="dropdown-item" href="#">Something else here</a></li>
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    )
}

function Sidebar(props) {
    const [renderCount, setRenderCount] = React.useState(0);

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
                alert(result.message);
            })
    };

    return (
        <div className="d-flex flex-column align-items-stretch flex-shrink-0 bg-white vh-100">
            <div className="d-flex align-items-center flex-shrink-0 p-3 link-dark text-decoration-none border-bottom position-sticky">
                <span className="fs-5 fw-semibold">Search Pane <ReactRouterDOM.Link to="/favorites">Favorites</ReactRouterDOM.Link></span>
            </div>
            <div className="list-group list-group-flush border-bottom overflow-y-scroll scrollarea">
                {Object.keys(props.markers).map(key => (
                    <a key={key} onClick={() => animateMarker(key)} className="list-group-item list-group-item-action py-3 lh-tight">
                        <div className="d-flex w-100 align-items-center justify-content-between">
                            <strong className="mb-1">{props.markers[key].title}</strong>
                            <i className="las la-charging-station la-3x"></i>
                        </div>
                        <div className="d-flex w-100 align-items-center justify-content-between">
                            <div className="col-10 mb-1 small sidebarAddress"><p>{props.markers[key].addressLine1}</p><p>{props.markers[key].town}, {props.markers[key].stateOrProvince} {props.markers[key].postcode}</p></div>
                            {localStorage.getItem('user_id') ? <i className="las la-heart la-2x addFavorite" onClick={() => addFavorite(props.markers[key].id, props.markers[key].lat, props.markers[key].lng)}></i> : null}
                        </div>
                    </a>
                ))}
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
                    <span className="fs-5 fw-semibold">Favorites <ReactRouterDOM.Link to="/">Search</ReactRouterDOM.Link></span>
                </div>
                <div className="list-group list-group-flush border-bottom overflow-y-scroll scrollarea">
                    {favorites.map(favorite => (
                        <a key={favorite.id} onClick={() => animateMarker(favorite.id)} className="list-group-item list-group-item-action py-3 lh-tight">
                            <div className="d-flex w-100 align-items-center justify-content-between">
                                <strong className="mb-1">{favorite.title}</strong>
                                <i className="las la-charging-station la-3x"></i>
                            </div>
                            <div className="d-flex w-100 align-items-center justify-content-between">
                                <div className="col-10 mb-1 small sidebarAddress"><p>{favorite.addressLine1}</p><p>{favorite.town}, {favorite.stateOrProvince} {favorite.postcode}</p></div>
                                {/* {localStorage.getItem('user_id') ? <i className="las la-heart la-2x addFavorite" onClick={() => addFavorite(props.markers[key].id, props.markers[key].lat, props.markers[key].lng)}></i> : null} */}
                            </div>
                        </a>
                    ))}
                </div>
            </div>
        );
    } else {
        return (
            <div className="d-flex flex-column align-items-stretch flex-shrink-0 bg-white vh-100">
                <div className="d-flex align-items-center flex-shrink-0 p-3 link-dark text-decoration-none border-bottom position-sticky">
                    <span className="fs-5 fw-semibold">Favorites <ReactRouterDOM.Link to="/">Search</ReactRouterDOM.Link></span>
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
        {/* <ReactRouterDOM.Route exact path="/charger_details/:ocm_poi_id">
            <ChargerDetails />
        </ReactRouterDOM.Route> */}
    </ReactRouterDOM.HashRouter>
);