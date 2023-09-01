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

    return (
        <div className="d-flex flex-column align-items-stretch flex-shrink-0 bg-white overflow-y-scroll vh-100">
            <div className="d-flex align-items-center flex-shrink-0 p-3 link-dark text-decoration-none border-bottom">
                <span className="fs-5 fw-semibold">Search Pane</span>
            </div>
            <div className="list-group list-group-flush border-bottom scrollarea">
                {Object.keys(props.markers).map(key => (
                    <a key={key} onClick={() => animateMarker(key)} className="list-group-item list-group-item-action py-3 lh-tight">
                        <div className="d-flex w-100 align-items-center justify-content-between">
                            <strong className="mb-1">{props.markers[key].title}</strong>
                            <i className="las la-charging-station la-3x"></i>
                        </div>
                        <div className="col-10 mb-1 small sidebarAddress"><p>{props.markers[key].addressLine1}</p><p>{props.markers[key].town}, {props.markers[key].stateOrProvince} {props.markers[key].postcode}</p></div>
                    </a>
                ))}
            </div>
        </div>
    );
}

const container = document.getElementById('sidebar');
const root = ReactDOM.createRoot(container);
root.render(<Sidebar markers={markers} />);