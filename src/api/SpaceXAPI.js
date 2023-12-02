class SpaceXAPI {

    SpaceXAPI() {
        this.baseUrl = "https://api.spacexdata.com";
        this.apiKey = "DEMO_KEY";
        this.version = "v4";
    }

    switchToLatestVersion() {
        this.version = 'v5';
    }

    getAllLaunches() {
        return fetch(`${this.baseUrl}/${this.version}/launches`)
            .then(response => response.json())
            .then(data => data);
    }

    getLatestLaunch() {
        return fetch(`${this.baseUrl}/${this.version}/launches/latest`)
            .then(response => response.json())
            .then(data => data);
    }

    getNextLaunch() {
        return fetch(`${this.baseUrl}/${this.version}/launches/next`)
            .then(response => response.json())
            .then(data => data);
    }

    getLaunchById(id) {
        return fetch(`${this.baseUrl}/${this.version}/launches/${id}`)
            .then(response => response.json())
            .then(data => data);
    }


}