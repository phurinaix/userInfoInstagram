var searchButton = document.getElementById("search");
var userImage = document.getElementById("user-image");

document.getElementById("name").onkeydown = function (e) {
    if(e.keyCode == 13){ 
        searchButton.click();
    }
};

searchButton.addEventListener("click", function () {
    // userInfo.innerHTML = "";
    document.getElementById("user-info").style.display = "block";
    userImage.innerHTML = "";
    var name = document.getElementById("name");
    var http = new XMLHttpRequest();

    http.onreadystatechange = function () {
        if (http.readyState == 4 && http.status == 200) {
            const content = http.response;
            getUserInfo(content);
            const jsonObject = content.match(/<script type="text\/javascript">window\._sharedData = (.*)<\/script>/)[1].slice(0, -1);
            const data = JSON.parse(jsonObject);

            const mediaArray = data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;

            for (let media of mediaArray) {
                const node = media.node
                
                // Process only if is an image
                if ((node.__typename && node.__typename !== 'GraphImage' && node.__typename !== 'GraphSidecar')) {
                    continue
                }

                // Push the thumbnail src in the array
                userImage.innerHTML += `
                    <div class="gallery-item" tabindex="0">
                        <img src=${node.thumbnail_src} class="gallery-image" alt="">
                    </div>
                `;
                console.log(node.thumbnail_src);
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
                var userName = meta.getAttribute("content").match(/(@)([A-Za-z]+[^)])/)[2];
                document.getElementById("profile-user-name").innerHTML = userName;
                document.getElementsByClassName("profile-real-name")[0].innerHTML = userName;
            }
            else if (og == "og:image") {
                document.getElementById("profile-image").innerHTML = `<img src=${meta.getAttribute("content")}>`;
            }
            else if (og == "og:description") {
                // userInfo.innerHTML += `<p>${meta.getAttribute("content")}</p>`;
                var followers = meta.getAttribute("content").match(/([0-9]{1,7}) (Followers)/)[1];
                var following = meta.getAttribute("content").match(/([0-9]{1,7}) (Following)/)[1];
                var posts = meta.getAttribute("content").match(/([0-9]{1,7}) (Posts)/)[1];
                document.getElementsByClassName("profile-stat-count")[0].innerHTML = posts;
                document.getElementsByClassName("profile-stat-count")[1].innerHTML = followers;
                document.getElementsByClassName("profile-stat-count")[2].innerHTML = following;
            }
            else if (og == "og:url") {
                // userInfo.innerHTML += `<a href=${meta.getAttribute("content")} target="_blank">user profile</a>`;
            }
        }
    }
});

