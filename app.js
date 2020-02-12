const fs = require("fs");
const touch = require("touch");
const path = require("path");

const tmi = require("tmi.js");
let { PythonShell } = require("python-shell");

const configFolder = "config";

const handlerScript = path.join(__dirname, "scripts/directkeys2.py");
var scriptString = fs.readFileSync(handlerScript, "utf-8");

var keymapContent = require("./scripts/keycodes.json"); // Read with require so it can be packaged

var configPath = path.join(configFolder, "user.json");

const defaultConfig = {
  botname: "TwitchPlays",
  channel: "icrazyblazelive",
  key: "oauth:yourkeyhere",
  prefix: "!"
};

var isAcceptingCommands = true;

// Attempt to load JSON files
try {
  var configFile = fs.readFileSync(configPath);
  console.log("Configuration loaded!");

} catch (error) {
  console.log(
    "Could not find configuration file. The file has now been created. Please edit it and re-run the program!"
  );

  if (!fs.existsSync(configFolder)) {
    fs.mkdirSync(configFolder);
  }

  touch(configPath);

  let configData = JSON.stringify(defaultConfig, null, 2);
  fs.writeFileSync(configPath, configData);

  return;
}

// Get JSON content
var configContent = JSON.parse(configFile);

// Set variables from JSON
var botname = configContent.botname;
var key = configContent.key;
var channel = configContent.channel;
var prefix = configContent.prefix;

const client = new tmi.Client({
  options: { debug: true },
  connection: {
    reconnect: true,
    secure: true
  },
  identity: {
    username: botname,
    password: key
  },
  channels: [channel]
});
client.connect();

client.on("message", (channel, tags, message, self) => {
  if (self) return;

  if (message.startsWith(prefix)) {
    if (tags.badges.broadcaster == 1 || tags.badges.moderator == 1) {
      var returnvalue = parseTwitchCommand(message.substring(prefix.length));
      if (returnvalue != null) {
        client.say(channel, returnvalue);
      }
    }
  }

  if (!isAcceptingCommands) return;

  for (var id in keymapContent.names) {
    var id_value = keymapContent.names[id];

    if (message.toUpperCase() == id.toUpperCase()) {
      for (idv in id_value) {
        value = id_value[idv];

        // id value is an array
        // Get hold time
        var holdtime = value.split(/:(.+)/)[1]; // split by :

        if (holdtime == null) {
          holdtime = 0;
        }

        var id_stripped = value.substring(
          0,
          value.length - holdtime.toString().length - 1
        );

        var sentKey = sendKey(id_stripped, holdtime);

        if (sentKey == true) {
          // Display command
          console.log(tags["display-name"] + ": " + message);
        }
      }
    }
  }
});

function parseTwitchCommand(cmd) {
  // Twitch chat commands will be added later
  console.log("Got moderator command: " + cmd);

  if (cmd == "togglelock") {
    isAcceptingCommands = !isAcceptingCommands;
    if (isAcceptingCommands) {
      return "Now accepting commands.";
    } else {
      return "Stopped accepting commands.";
    }
  }

  if (cmd == "quitgame") {
	// Quit function (Chocolate DOOM)

    if (isAcceptingCommands) {
      parseTwitchCommand("togglelock");
    }

    setTimeout(function() {
      sendKey("DIK_ESCAPE", 0.1);
      sendKey("DIK_UP", 0.1);
      sendKey("DIK_RETURN", 0.1);
      sendKey("DIK_Y", 0.1);
      return "Quit the game.";
    }, 1000);
  }
}

function sendKey(keycode, holdtime) {
  // Convert DIK code to hex Scancode using keymap
  for (var sendCode in keymapContent.codes) {
    var code_value = keymapContent.codes[sendCode];

    if (keycode == sendCode) {
      return runPython(code_value, holdtime);
    }
  }

  return false;
}

function runPython(opt, sec) {
  var options = {
    mode: "text",
    pythonPath: "python",
    args: [opt, sec]
  };

  PythonShell.runString(scriptString, options, function(err) {
    if (err) {
      console.log(err);
      return false;
    } else {
      return true;
    }
  });
}
