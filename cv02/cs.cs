body {
  background: #20262E;
  padding: 20px;
  font-family: Helvetica;
}

#banner-message {
  background: #fff;
  border-radius: 4px;
  padding: 20px;
  font-size: 25px;
  text-align: center;
  transition: all 0.2s;
  margin: 0 auto;
  width: 300px;
}

button {
  background: #0084ff;
  border: none;
  border-radius: 5px;
  padding: 8px 14px;
  font-size: 15px;
  color: #fff;
}

#banner-message.alt {
  background: #0084ff;
  color: #fff;
  margin-top: 40px;
  width: 200px;
}

#banner-message.alt button {
  background: #fff;
  color: #000;
}

#div1 {
  background: #000000;
  color: #ffffff;
  margin-top: 5px;
}

#div2 {
  background: #222222;
  color: #ffffff;
  margin-top: 5px;
}

#div3 {
  background: #444444;
  color: #ffffff;
  margin-top: 5px;
}

#divsHorizontal {
    display: flex;
    border: 1px solid black;
    overflow: hidden; /* add this to contain floated children */
}

.divHorizontal {
    width: 300px;
    float: left; /* add this */
    border: 1px solid red;
    display: inline-block;
    margin: 5px;
}

.margin {
    position: fixed;
    padding: 10px;
    background-color: lightgrey;
    color: black;
}

#top {
    top: 0;
    left: 0;
    right: 0;
    text-align: center;
}

#bottom {
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
}

#left {
    top: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    writing-mode: vertical-lr;
    text-orientation: mixed;
}

#right {
    top: 0;
    bottom: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    writing-mode: vertical-lr;
    text-orientation: mixed;
}

.center {
    padding: 20px;
    background-color: #009578;
    color: white;
    text-align: center;
}