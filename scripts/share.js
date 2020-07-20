var a2a_config = a2a_config || {};
a2a_config.templates = a2a_config.templates || {};

a2a_config.templates.facebook = {
    app_id: "5303202981",
    redirect_uri: "https://static.addtoany.com/menu/thanks.html",
    quote: "My Yellow Brick Code profile",
    hashtag: "learninghowtosoftwareengineer,coder,YellowBrickCode"
};

a2a_config.templates.twitter = {
    text: "My Yellow Brick Code profile: ${title} ${link}",
    hashtags: "YellowBrickCode,coding,softwareengineering"
};

// A custom "onReady" handler for AddToAny
function my_addtoany_onready() {
    events_demo.innerHTML = 'AddToAny is ready!';
}

// A custom "onShare" handler for AddToAny
function my_addtoany_onshare(data) {
    events_demo.innerHTML = 'Shared &quot;<a href="'
        + data.url
        + '">'
        + data.title
        + '</a>&quot; to '
        + data.service
        + '!';
}
// A custom "onReady" handler for AddToAny
function my_addtoany_onready() {
    events_demo.innerHTML = 'AddToAny is ready!';
}

// A custom "onShare" handler for AddToAny
function my_addtoany_onshare(data) {
    events_demo.innerHTML = 'Shared &quot;<a href="'
        + data.url
        + '">'
        + data.title
        + '</a>&quot; to '
        + data.service
        + '!';
}

// Setup AddToAny "onReady" and "onShare" callback functions
var a2a_config = a2a_config || {};
a2a_config.callbacks = a2a_config.callbacks || [];
a2a_config.callbacks.push({
    ready: my_addtoany_onready,
    share: my_addtoany_onshare
});