function getRouteTypeName(type) {
    switch (type) {
        case 0:
            return "Tram";
        case 1:
            return "Subway";
        case 2:
            return "Rail";
        case 3:
            return "Bus";
        case 4:
            return "Ferry";
        default:
            return "Unknown";
    }
}
function formatUnixTime(unixTime) {
    if (!unixTime) return "";

    const date = new Date(unixTime * 1000);

    return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
    });
}

async function getRouteInfo(chateau, routeId) {
    const url = `https://birch.catenarymaps.org/route_info_v2?chateau=${chateau}&route_id=${routeId}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();

        console.log("Route Info:", data);

        const table = document.getElementById("routeTable");

        table.innerHTML = `
            <tr>
                <td>${data.agency_name ?? ""}</td>
                <td>${data.long_name ?? ""}</td>
                <td>
                    <div style="
                        width:20px;
                        height:20px;
                        background:${data.color};
                        border:1px solid #000;
                    "></div>
                </td>
                <td>${getRouteTypeName(data.route_type)}</td>
                <td>
                    <a href="${data.url}" target="_blank">
                        View Route
                    </a>
                </td>
            </tr>
        `;
    } catch (error) {
        console.error("Route Info Error:", error);
    }
}

async function getStationDepartures(osmStationId) {
    const now = Math.floor(Date.now() / 1000);

    const greaterThan = now;
    const lessThan = now + 3600;

    const url =
        `https://birch.catenarymaps.org/departures_at_osm_station` +
        `?osm_station_id=${osmStationId}` +
        `&greater_than_time=${greaterThan}` +
        `&less_than_time=${lessThan}` +
        `&include_shapes=false`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();

        console.log("Station Data:", data);

        const stop_table = document.getElementById("stopsTable");
        stop_table.innerHTML = "";
        data.stops.forEach((stop) => {
            stop_table.innerHTML += `
                <tr>
                    <td>${stop.stop_id}</td>
                    <td>${stop.stop_name}</td>
                    <td>${stop.stop_code ?? ""}</td>
                    <td>${stop.parent_station ?? ""}</td>
                    <td>${stop.stop_lat}</td>
                    <td>${stop.stop_lon}</td>
                </tr>
            `;
        });
        const routes_table = document.getElementById("routesTable");
        routes_table.innerHTML = "";
        Object.entries(data.routes).forEach(([agencyName, routes]) => {
            Object.values(routes).forEach(route => {
                routes_table.innerHTML += `
                    <tr>
                        <td>${route.route_id}</td>
                        <td>${route.long_name}</td>
                        <td>${getRouteTypeName(route.route_type)}</td>
                        <td>
                            <div style="
                                width:20px;
                                height:20px;
                                background:${route.color};
                                border:1px solid #000;
                            "></div>
                        </td>
                        <td>
                            <a href="${route.url}" target="_blank">
                                View Route
                            </a>
                        </td>
                    </tr>
            `;
            });
        });
        const alerts_table = document.getElementById("alertsTable");
        alerts_table.innerHTML = "";
        Object.entries(data.alerts).forEach(([agencyName, alerts]) => {
            Object.values(alerts).forEach(alert => {
                alerts_table.innerHTML += `
                    <tr>
                        <td>${alert.cause}</td>
                        <td>${alert.effect}</td>
                        
                        
                    </tr>
            `;
            });
        });
        const event_table = document.getElementById("eventTable");
        event_table.innerHTML = "";
        const events = data.events.forEach((event) => {
            event_table.innerHTML += `
                <tr>
                    <th>${formatUnixTime(event.scheduled_arrival)}</th>
                    <td>${formatUnixTime(event.realtime_arrival)}</td>
                    <td>${event.route_id}</td>
                    <td>${event.headsign}</td>
                </tr>
            `;
        });
    } catch (error) {
        console.error("Departures Error:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    getRouteInfo("metro~losangeles", 802);
    getStationDepartures(268547062);
});
