var searchButton = document.getElementById("search");
var userInfo = document.getElementById("user-info");
var userImage = document.getElementById("user-image");

document.getElementById("name").onkeydown = function (e) {
    if(e.keyCode == 13){ 
        searchButton.click();
    }
};

searchButton.addEventListener("click", function () {
    userInfo.innerHTML = "";
    userImage.innerHTML = "";
    var name = document.getElementById("name");
    var http = new XMLHttpRequest();

    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            const content = http.response;
            getUserInfo(content);
            const jsonObject = content.match(/<script type="text\/javascript">window\._sharedData = (.*)<\/script>/)[1].slice(0, -1);
            const data = JSON.parse(jsonObject);

            const mediaArray = data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges

            for (let media of mediaArray) {
                const node = media.node
                
                // Process only if is an image
                if ((node.__typename && node.__typename !== 'GraphImage' && node.__typename !== 'GraphSidecar')) {
                    continue
                }

                // Push the thumbnail src in the array
                userImage.innerHTML += `<img src=${node.thumbnail_src} width="200px" height="200px">`;
            }
        }
    }
    http.open("GET", `https://www.instagram.com/${name.value}/`, true);
    http.send();

    getUserInfo = function (content) {
        const parser = new DOMParser();
        const dom = parser.parseFromString(content, "text/html");
    
        var metaTags = dom.getElementsByTagName("meta");
        for (meta of metaTags) {
            og = meta.getAttribute("property");
            if (og == "og:title") {
                userInfo.innerHTML += `<h2>${meta.getAttribute("content").replace(/• Instagram photos and videos/, "")}</h2>`;
            }
            else if (og == "og:image") {
                userInfo.innerHTML += `<img src=${meta.getAttribute("content")}>`;
            }
            else if (og == "og:description") {
                userInfo.innerHTML += `<p>${meta.getAttribute("content")}</p>`;
            }
            else if (og == "og:url") {
                userInfo.innerHTML += `<a href=${meta.getAttribute("content")} target="_blank">user profile</a>`;
            }
        }
    }
});

