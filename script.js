var searchButton = document.getElementById("search");
var userImage = document.getElementById("user-image");

function sendAjaxMsg (url, message) {
    function asynCode (resolve, reject) {
        let request = new XMLHttpRequest();

        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                resolve(request.responseText);
            }
        };

        request.onerror = function (error) {
            let errorMsg = "Error status: " + request.status;
            reject(errorMsg);
        };

        request.open("GET", url + message, true);
        request.send();
    }
    return new Promise(asynCode);
}

document.getElementById("name").onkeydown = function (e) {
    if(e.keyCode == 13){ 
        searchButton.click();
    }
};

searchButton.addEventListener("click", function () {
    var name = document.getElementById("name");
    let ajax = sendAjaxMsg("https://www.instagram.com/", name.value);

    function handle (value) {
        document.getElementById("user-info").style.display = "block";
        userImage.innerHTML = "";

        const parser = new DOMParser();
        const dom = parser.parseFromString(value, "text/html");
        for (let meta of dom.getElementsByTagName("meta")) {
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
                var followers = meta.getAttribute("content").match(/([0-9]{1,7}) (Followers)/)[1];
                var following = meta.getAttribute("content").match(/([0-9]{1,7}) (Following)/)[1];
                var posts = meta.getAttribute("content").match(/([0-9]{1,7}) (Posts)/)[1];
                document.getElementsByClassName("profile-stat-count")[0].innerHTML = posts;
                document.getElementsByClassName("profile-stat-count")[1].innerHTML = followers;
                document.getElementsByClassName("profile-stat-count")[2].innerHTML = following;
            }
        }

        const jsonObject = value.match(/<script type="text\/javascript">window\._sharedData = (.*)<\/script>/)[1].slice(0, -1);
        const data = JSON.parse(jsonObject);
        const mediaArray = data.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media.edges;

        for (let media of mediaArray) {
            const node = media.node
            
            if ((node.__typename && node.__typename !== 'GraphImage' && node.__typename !== 'GraphSidecar')) {
                continue
            }
            userImage.innerHTML += `
                <div class="gallery-item" tabindex="0">
                    <img src=${node.thumbnail_src} class="gallery-image" alt="">
                </div>
            `;
            // console.log(node.thumbnail_src);
        }
    }

    function errorHandle(errMsg) {
        document.getElementById("user-info").innerHTML = `<h1>${errMsg}</h1>`;
    }

    ajax.then(handle, errorHandle);
});