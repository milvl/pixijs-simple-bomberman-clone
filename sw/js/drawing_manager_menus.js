import * as PIXI from 'pixi.js';
import { HEX_COLOR_CODES } from "./constants/color_codes.js";

const MODULE_NAME_PREFIX = 'drawing_manager_menus.js - ';

const TEXT_RECT_RADIUS_SCALE_TO_RECT_WIDTH = 1/15;
const TEXT_RECT_FONT_SIZE_SCALE = 1/2;
const TITLE_FONT_FAMILY = "Emulogic zrEw";
const TEXT_FONT_FAMILY = "Pressstart2p Vav7";

/**
 * Returns a string with a safe margin around it.
 * @param {String} text - The text to display.
 * @returns {String} The text with a safe margin around it.
 */
function getStringWithSafeMargin(text) {
    return '  ' + text + '  ';
}

/**
* Returns the font size that fits the text scale.
* @param {String} textString - The text to display.
* @param {Number} maxWidth - The maximum width of the text.
* @param {Number} maxHeight - The maximum height of the text.
* @param {String} fontFamily - The font family to use.
* @param {String} alignment - The alignment of the text.
* @returns {Number} The font size that fits the text scale.
*/
function getFontSize(textString, maxWidth, maxHeight, fontFamily = 'Arial', alignment = 'left') {
   let fontSize = 1;
   let text = new PIXI.Text({text: textString, style: {
       fontFamily: fontFamily,
       fontSize: fontSize,
       fill: HEX_COLOR_CODES.BLACK,  // text color
   }});
   while (text.height < maxHeight) {
       fontSize++;
       text.style.fontSize = fontSize;
   }
   fontSize--;
   while (text.width > maxWidth) {
       fontSize--;
       text.style.fontSize = fontSize;
   }
   return fontSize;
}

/**
     * Returns a PIXI.Text object with the text centered in a rectangle.
     * @param {String} text - The text to display.
     * @param {Number} x - The x-coordinate of the rectangle.
     * @param {Number} y - The y-coordinate of the rectangle.
     * @param {Number} logoRectWidth - The width of the rectangle.
     * @param {Number} logoRectHeight - The height of the rectangle.
     * @param {String} fontFamily - The font family to use.
     * @returns {PIXI.Text} The PIXI.Text object.
     */
function getBespokeRectText(text, x, y, logoRectWidth, logoRectHeight, fontFamily = 'Arial') {
    let logoText = new PIXI.Text({'text': text, 'style': {
        fontFamily: fontFamily,
        fontSize: logoRectHeight * TEXT_RECT_FONT_SIZE_SCALE,
        fill: HEX_COLOR_CODES.BLACK,  // text color
        align: 'center'}
    });
    while (logoText.width > logoRectWidth) {
        logoText.style.fontSize -= 1;   // decrease font size until it fits (expects small num of iterations)
    }

    logoText.x = x + (logoRectWidth / 2) - (logoText.width / 2);  // center text horizontally
    logoText.y = y + (logoRectHeight / 2) - (logoText.height / 2);  // center text vertically

    return logoText;
}

/**
 * Parses milliseconds into a time string.
 * @param {Number} milliseconds - The time in milliseconds. 
 * @returns {String} The time string in the format "mm:ss" or "hh:mm:ss" if hours are present.
 */
function parseTime(milliseconds) {
    if (milliseconds < 0) {
        milliseconds = 0;
    }
    let seconds = Math.floor(milliseconds / 1000);
    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);
    seconds = seconds % 60;

    if (hours > 0) {
        // I am not expecting someone to play for 100 hours straight so I won't bother scaling this
        if (hours > 99) {
            return '(ㆆ_ㆆ)????'
        }
        minutes = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    else {
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

/**
 * Handles the drawing of the main menu.
 */
export class MainMenuDrawingManager {
    LOGO_TEXT_STRING = 'KIV/UUR - BomberMan Clone';
    LOGO_WIDTH_SCALE = 1/2;
    LOGO_HEIGHT_SCALE = 1/5;
    LOGO_Y_OFFSET_SCALE = 1/10;
    BUTTON_WIDTH_SCALE = 1/4;
    BUTTON_HEIGHT_SCALE = 1/12;
    SELECT_MARKER_MARGIN_TO_BUTTON_SCALE_X = 1/10;
    SELECTE_MARKER_LOCATION_TO_BUTTON_SCALE_Y = 1/2;

    /**
     * Constructor for the MainMenuDrawingManager class.
     * @param {App} app - The main application object.
     * @param {Object} textures - The textures object.
     * @param {Object} screenContent - The screen content object.
     */
    constructor(app, textures, screenContent) {
        this.app = app;
        this.textures = textures;
        this.screenContent = screenContent;
    }

    /**
     * Draws the background of the main menu.
     */
    #drawBackground() {
        const background = new PIXI.Graphics();
        background.fill(HEX_COLOR_CODES.BLACK);
        background.rect(0, 0, this.app.screen.width, this.app.screen.height);
        this.app.stage.addChild(background);
    }

    /**
     * Draws the logo of the main menu.
     */
    #drawLogo() {
        // now use simple text
        let logoString = getStringWithSafeMargin(this.LOGO_TEXT_STRING);
        let logoRect = new PIXI.Graphics();
        let x = (this.app.screen.width - (this.app.screen.width * this.LOGO_WIDTH_SCALE)) / 2;
        let y = this.app.screen.height * this.LOGO_Y_OFFSET_SCALE;
        let logoRectWidth = this.app.screen.width * this.LOGO_WIDTH_SCALE;
        let logoRectHeight = this.app.screen.height * this.LOGO_HEIGHT_SCALE;
        logoRect.roundRect(x, 
                                 y, 
                                 logoRectWidth,
                                 logoRectHeight,
                                 TEXT_RECT_RADIUS_SCALE_TO_RECT_WIDTH * logoRectWidth);
        logoRect.fill(HEX_COLOR_CODES.WHITE);
        this.app.stage.addChild(logoRect);

        // text
        const fontSize = getFontSize(logoString, logoRectWidth, logoRectHeight, TITLE_FONT_FAMILY);
        const logoText = new PIXI.Text({'text': logoString, 'style': {
            fontFamily: TITLE_FONT_FAMILY,
            fontSize: fontSize,
            fill: HEX_COLOR_CODES.BLACK,  // text color
            align: 'center'}
        });
        logoText.x = x + (logoRectWidth / 2) - (logoText.width / 2);  // center text horizontally
        logoText.y = y + (logoRectHeight / 2) - (logoText.height / 2);  // center text vertically

        this.app.stage.addChild(logoText);
    }

    /**
     * Draws the buttons of the main menu.
     */
    #drawButtons() {
        let x = (this.app.screen.width - this.app.screen.width * this.BUTTON_WIDTH_SCALE) / 2;
        let buttonWidth = this.app.screen.width * this.BUTTON_WIDTH_SCALE;
        let buttonHeight = this.app.screen.height * this.BUTTON_HEIGHT_SCALE;
        const fontSize = getFontSize(getStringWithSafeMargin(this.screenContent.options.reduce((a, b) => a.length > b.length ? a : b)), 
                                     buttonWidth, 
                                     buttonHeight, 
                                     TEXT_FONT_FAMILY);

        for (let i = 0; i < this.screenContent.options.length; i++) {
            let offsetFromLogo = this.app.screen.height * this.LOGO_Y_OFFSET_SCALE * 2 + (this.app.screen.height * this.LOGO_HEIGHT_SCALE);
            let y = offsetFromLogo + (this.app.screen.height * this.BUTTON_HEIGHT_SCALE * i * 2);
            let button = new PIXI.Graphics();
            button.roundRect(x, 
                                   y, 
                                   buttonWidth, 
                                   buttonHeight, 
                                   TEXT_RECT_RADIUS_SCALE_TO_RECT_WIDTH * buttonWidth);
            button.fill(HEX_COLOR_CODES.WHITE);
            this.app.stage.addChild(button);
            
            // text
            let buttonTextString = getStringWithSafeMargin(this.screenContent.options[i]);
            let buttonText = new PIXI.Text({'text': buttonTextString, 'style': {
                fontFamily: TEXT_FONT_FAMILY,
                fontSize: fontSize,
                fill: HEX_COLOR_CODES.BLACK,  // text color
                align: 'center'}
            });
            buttonText.x = x + (buttonWidth / 2) - (buttonText.width / 2);  // center text horizontally
            buttonText.y = y + (buttonHeight / 2) - (buttonText.height / 2);  // center text vertically

            this.app.stage.addChild(buttonText);

            // add >> << around button if selected
            if (i === this.screenContent.selected) {
                let leftArrow = new PIXI.Graphics();
                let polygonPoints = [x - buttonWidth * this.SELECT_MARKER_MARGIN_TO_BUTTON_SCALE_X,
                                      y + buttonHeight * this.SELECTE_MARKER_LOCATION_TO_BUTTON_SCALE_Y,       // middle of button
                                      x - (2 * buttonWidth * this.SELECT_MARKER_MARGIN_TO_BUTTON_SCALE_X),
                                      y,                                                                        // top of button
                                      x - (2 * buttonWidth * this.SELECT_MARKER_MARGIN_TO_BUTTON_SCALE_X),
                                      y + buttonHeight];                                                       // bottom of button
                leftArrow.drawPolygon(polygonPoints);
                leftArrow.fill(HEX_COLOR_CODES.WHITE);
                this.app.stage.addChild(leftArrow);

                let rightArrow = new PIXI.Graphics();
                polygonPoints = [x + buttonWidth + buttonWidth* this.SELECT_MARKER_MARGIN_TO_BUTTON_SCALE_X,
                                  y + buttonHeight * this.SELECTE_MARKER_LOCATION_TO_BUTTON_SCALE_Y,       // middle of button
                                  x + buttonWidth + (2 * buttonWidth * this.SELECT_MARKER_MARGIN_TO_BUTTON_SCALE_X),
                                  y,                                                                        // top of button
                                  x + buttonWidth + (2 * buttonWidth * this.SELECT_MARKER_MARGIN_TO_BUTTON_SCALE_X),
                                  y + buttonHeight];                                                       // bottom of button
                rightArrow.drawPolygon(polygonPoints);
                rightArrow.fill(HEX_COLOR_CODES.WHITE);
                this.app.stage.addChild(rightArrow);
            }
        }
    }

    /**
     * Draws the main menu.
     */
    draw() {
        this.#drawBackground();
        this.#drawLogo();
        this.#drawButtons();
    }

    /**
     * Redraws the main menu.
     */
    redraw() {
        this.app.stage.removeChildren();
        this.draw();
    }

    /**
     * Destroys the main menu.
     */
    cleanUp() {
        this.app.stage.removeChildren();
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * Handles the drawing of settings.
 */
export class SettingsDrawingManager {
    TITLE_STRING = 'Settings';
    TITLE_WIDTH_SCALE = 1/2;
    TITLE_HEIGHT_SCALE = 1/5;
    TITLE_Y_OFFSET_SCALE = 1/10;
    OPTIONS_TEXT_WIDTH_SCALE = 1/2 * 3/4;
    OPTIONS_TEXT_HEIGHT_SCALE = (6/10) * (2/16);
    OPTIONS_TEXT_GAP_SCALE = (6/10) * (1/16);

    /**
     * Constructor for the SettingsDrawingManager class.
     * @param {App} app - The main application object.
     * @param {Object} textures - The textures object.
     * @param {Object} screenContent - The screen content object.
     */
    constructor(app, textures, screenContent) {
        this.app = app;
        this.textures = textures;
        this.screenContent = screenContent;
    }

    /**
     * Draws the background of the settings.
     */
    #drawBackground() {
        const background = new PIXI.Graphics();
        background.beginFill(HEX_COLOR_CODES.BLACK);
        background.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
        background.endFill();
        this.app.stage.addChild(background);
    }

    /**
     * Draws the title of the settings.
     */
    #drawTitle() {
        const titleString = getStringWithSafeMargin(this.TITLE_STRING);
        const titleRect = new PIXI.Graphics();
        const x = (this.app.screen.width - (this.app.screen.width * this.TITLE_WIDTH_SCALE)) / 2;
        const y = this.app.screen.height * this.TITLE_Y_OFFSET_SCALE;
        const titleRectWidth = this.app.screen.width * this.TITLE_WIDTH_SCALE;
        const titleRectHeight = this.app.screen.height * this.TITLE_HEIGHT_SCALE;
        const fontSize = getFontSize(titleString, titleRectWidth, titleRectHeight, TITLE_FONT_FAMILY);
        titleRect.beginFill(HEX_COLOR_CODES.WHITE);
        titleRect.drawRoundedRect(x, 
                                  y, 
                                  titleRectWidth,
                                  titleRectHeight,
                                  TEXT_RECT_RADIUS_SCALE_TO_RECT_WIDTH * titleRectWidth);
        titleRect.endFill();
        this.app.stage.addChild(titleRect);

        // text
        let titleText = new PIXI.Text({'text': titleString, 'style': {
            fontFamily: TITLE_FONT_FAMILY,
            fontSize: fontSize,
            fill: HEX_COLOR_CODES.BLACK,  // text color
            align: 'center'}
        });
        titleText.x = x + (titleRectWidth / 2) - (titleText.width / 2);  // center text horizontally
        titleText.y = y + (titleRectHeight / 2) - (titleText.height / 2);  // center text vertically

        this.app.stage.addChild(titleText);
    }

    /**
     * Returns the string for the on/off toggle.
     * @param {String} prefix - The prefix for the text.
     */
    #getFormattedOptionString(prefix, value) {
        if (value === undefined) {
            return prefix;
        }
        if (typeof value === 'number') {
            return prefix + value;
        }
        return prefix + (value ? 'On' : 'Off');
    }

    /**
     * Draws the options of the settings.
     */
    #drawOptions() {
        const x = (this.app.screen.width - (this.app.screen.width * this.TITLE_WIDTH_SCALE)) / 2;
        let y = undefined;
        const y_TitleWithMargins = this.app.screen.height * this.TITLE_Y_OFFSET_SCALE * 2 + (this.app.screen.height * this.TITLE_HEIGHT_SCALE);
        const maxOptionTextHeight = this.app.screen.height * this.OPTIONS_TEXT_HEIGHT_SCALE;
        const optionTextGap = this.app.screen.height * this.OPTIONS_TEXT_GAP_SCALE;

        // find font size fitting text scale
        const fontSize = getFontSize(getStringWithSafeMargin(this.screenContent.options.reduce((a, b) => a.length > b.length ? a : b)), 
                                     this.app.screen.width * this.OPTIONS_TEXT_WIDTH_SCALE, 
                                     maxOptionTextHeight, 
                                     TEXT_FONT_FAMILY);
        
        for (let i = 0; i < this.screenContent.options.length; i++) {
            // y = y_TitleWithMargins + (maxOptionTextHeight / 2) + (maxOptionTextHeight + optionTextGap) * i;

            let optionString = this.#getFormattedOptionString(this.screenContent.options[i], this.screenContent.optionsValues[i]);
            optionString = getStringWithSafeMargin(optionString);

            let optionText = new PIXI.Text({text: optionString, style: {
                fontFamily: TEXT_FONT_FAMILY,
                fontSize: fontSize,
                fill: HEX_COLOR_CODES.WHITE,  // text color
                align: 'center'
            }});

            y = y_TitleWithMargins + (maxOptionTextHeight + optionTextGap) * i;
            
            // TODO NOTE: FONT WEIRDLY CENTERED VERTICALLY
            let y_fontOffset = -optionText.height / 1.25;
            
            optionText.x = x;
            optionText.y = y - y_fontOffset;
            this.app.stage.addChild(optionText);

            if (i === this.screenContent.selected) {
                let rightArrow = new PIXI.Graphics();
                rightArrow.beginFill(HEX_COLOR_CODES.WHITE);
                let x_titleEnd = x + (this.app.screen.width * this.TITLE_WIDTH_SCALE);
                let polygonPoints = [x_titleEnd,
                                      y,                    // top right of text
                                      x_titleEnd - maxOptionTextHeight,
                                      y + maxOptionTextHeight / 2,  // middle of text
                                      x_titleEnd,
                                      y + maxOptionTextHeight];     // bottom right of text

                rightArrow.drawPolygon(polygonPoints);
                rightArrow.endFill();
                this.app.stage.addChild(rightArrow);
            }
        }
    }

    /**
     * Draws the settings.
     */
    draw() {
        this.#drawBackground();
        this.#drawTitle();
        this.#drawOptions();
    }

    /**
     * Redraws the settings.
     */
    redraw() {
        this.app.stage.removeChildren();
        this.draw();
    }

    /**
     * Destroys the settings.
     */
    cleanUp() {
        this.app.stage.removeChildren();
    }
}

/**
 * Handles the drawing of the end game screen.
 */
export class EndGameDrawingManager {
    TITLE_HEIGHT_SCALE = 2/5;
    NAME_STRING_HEIGHT_SCALE = 1/5;
    SCALE_FONT_WIDTH_WEIRDNESS = 0.85;  // weirdness factor to make font fit better (it contains some empty space after each letter)

    constructor(app, textures, screenContent) {
        this.app = app;
        this.textures = textures;
        this.screenContent = screenContent;
    }

    /**
     * Draws the background of the end game screen.
     */
    #drawBackground() {
        const background = new PIXI.Graphics();
        background.rect(0, 0, this.app.screen.width, this.app.screen.height);
        background.fill(HEX_COLOR_CODES.BLACK);
        this.app.stage.addChild(background);
    }

    /**
     * Draws the title and user input for name entry.
     */
    #drawTitleAndInput() {
        const title = this.screenContent.title;
        const titleFontSize = getFontSize(title, this.app.screen.width, this.app.screen.height * this.TITLE_HEIGHT_SCALE, TITLE_FONT_FAMILY);

        // Title Text
        let titleText = new PIXI.Text(title, {
            fontFamily: TITLE_FONT_FAMILY,
            fontSize: titleFontSize,
            fill: HEX_COLOR_CODES.WHITE,
            align: 'center'
        });
        titleText.x = (this.app.screen.width / 2) - (titleText.width / 2);
        titleText.y = titleText.height / 4; // some margin from the top
        this.app.stage.addChild(titleText);

        // input Area
        this.#drawInputArea(titleText.y + titleText.height + titleText.height / 4); // some margin below the title
    }

    /**
     * Draws the area where players can enter their names.
     */
    #drawInputArea(startY) {
        // get current string of all 3 chars from screenContent
        const dummyString = this.screenContent.options.reduce((a, b) => a + b.letter, '');
        const dummyStringSelected = this.screenContent.options[this.screenContent.selected].letter;
        const fontSize = getFontSize(dummyString, this.app.screen.width, this.app.screen.height * this.NAME_STRING_HEIGHT_SCALE, TEXT_FONT_FAMILY);

        const dummyText = new PIXI.Text(dummyString, {
            fontFamily: TEXT_FONT_FAMILY,
            fontSize: fontSize,
            fill: HEX_COLOR_CODES.WHITE,
            align: 'center'
        });

        const dummyTextSelected = new PIXI.Text(dummyStringSelected, {
            fontFamily: TEXT_FONT_FAMILY,
            fontSize: fontSize,
            fill: HEX_COLOR_CODES.WHITE,
            align: 'center'
        });

        const nameInputX = ((this.app.screen.width - dummyText.width) / 2);

        // upper cursor
        let cursor = new PIXI.Graphics();
        cursor.drawPolygon([0, 0, 
                            dummyTextSelected.width * this.SCALE_FONT_WIDTH_WEIRDNESS, 0,
                            dummyTextSelected.width * this.SCALE_FONT_WIDTH_WEIRDNESS / 2, dummyText.height / 4]);
        cursor.fill(HEX_COLOR_CODES.WHITE);
        cursor.x = nameInputX + this.screenContent.selected * (dummyText.width / dummyString.length);
        cursor.y = startY;
        this.app.stage.addChild(cursor);


        // drawing each letter in the name
        this.screenContent.options.forEach((option, index) => {
            let letterX = nameInputX + (index * dummyText.width / dummyString.length);
            let letter = new PIXI.Text(option.letter, {
                fontFamily: TEXT_FONT_FAMILY,
                fontSize: fontSize,
                fill: HEX_COLOR_CODES.WHITE,
                align: 'center'
            });
            letter.x = letterX;
            letter.y = startY + cursor.height + cursor.height / 2;
            this.app.stage.addChild(letter);
        });

        // lower cursor
        cursor = new PIXI.Graphics();
        cursor.drawPolygon([dummyTextSelected.width * this.SCALE_FONT_WIDTH_WEIRDNESS / 2, 0,
                            0, dummyText.height / 4,
                            dummyTextSelected.width * this.SCALE_FONT_WIDTH_WEIRDNESS, dummyText.height / 4]);
        cursor.fill(HEX_COLOR_CODES.WHITE);
        cursor.x = nameInputX + this.screenContent.selected * (dummyText.width / dummyString.length);
        cursor.y = startY + cursor.height + cursor.height / 2 + dummyText.height 
        this.app.stage.addChild(cursor);
    }

    /**
     * Main method to draw the entire end game screen.
     */
    draw() {
        this.#drawBackground();
        this.#drawTitleAndInput();
    }

    /**
     * Redraws the end game screen.
     */
    redraw() {
        this.app.stage.removeChildren();
        this.draw();
    }

    /**
     * Cleans up the end game screen.
     */
    cleanUp() {
        this.app.stage.removeChildren();
    }
}

export class LeaderboardsDrawingManager {
    TITLE_WIDTH_TO_SCREEN_WIDTH_SCALE = 1/4;
    TITLE_HEIGHT_TO_SCREEN_HEIGHT_SCALE = 1/8;
    TITLE_Y_OFFSET_SCALE = 1/40;
    WAIT_SIGN_STRING = 'Loading...';
    WAIT_SIGN_HEIGHT_TO_SCREEN_HEIGHT_SCALE = 1/4;
    WAIT_SIGN_WIDTH_TO_SCREEN_WIDTH_SCALE = 1/2;
    CONTROL_AREA_WIDTH_TO_SCREEN_WIDTH_SCALE = (1 - (this.TITLE_WIDTH_TO_SCREEN_WIDTH_SCALE)) / 2;
    CONTROL_AREA_HEIGHT_TO_SCREEN_HEIGHT_SCALE = this.TITLE_HEIGHT_TO_SCREEN_HEIGHT_SCALE + 2*this.TITLE_Y_OFFSET_SCALE;
    CONTROL_AREA_INFO_OUTLINE_WIDTH_TO_CONTROL_AREA_WIDTH_SCALE = 3/4;
    LIVES_TEXT_WIDTH_TO_INFO_OUTLINE_WIDTH_SCALE = 3/4;
    LIVES_CURSOR_GAP_TO_TEXT_HEIGHT_SCALE = 1/10;
    LEADERBOARD_LINE_WIDTH_TO_SCREEN_WIDTH_SCALE = 97/100;

    constructor(app, textures, screenContent) {
        this.app = app;
        this.textures = textures;
        this.screenContent = screenContent;
    }

    #drawBackground() {
        const background = new PIXI.Graphics();
        background.rect(0, 0, this.app.screen.width, this.app.screen.height);
        background.fill(HEX_COLOR_CODES.BLACK);
        this.app.stage.addChild(background);
    }

    #drawTitle() {
        const titleString = getStringWithSafeMargin(this.screenContent.title);
        const titleRect = new PIXI.Graphics();
        const x = (this.app.screen.width - (this.app.screen.width * this.TITLE_WIDTH_TO_SCREEN_WIDTH_SCALE)) / 2;
        const y = this.app.screen.height * this.TITLE_Y_OFFSET_SCALE;
        const titleRectWidth = this.app.screen.width * this.TITLE_WIDTH_TO_SCREEN_WIDTH_SCALE;
        const titleRectHeight = this.app.screen.height * this.TITLE_HEIGHT_TO_SCREEN_HEIGHT_SCALE;
        const fontSize = getFontSize(titleString, titleRectWidth, titleRectHeight, TITLE_FONT_FAMILY);
        titleRect.roundRect(x, y, titleRectWidth, titleRectHeight, TEXT_RECT_RADIUS_SCALE_TO_RECT_WIDTH * titleRectWidth);
        titleRect.fill(HEX_COLOR_CODES.WHITE);
        this.app.stage.addChild(titleRect);

        // text
        let titleText = new PIXI.Text({'text': titleString, 'style':{
            fontFamily: TITLE_FONT_FAMILY,
            fontSize: fontSize,
            fill: HEX_COLOR_CODES.BLACK,
            align: 'center'
        }});
        titleText.x = x + (titleRectWidth / 2) - (titleText.width / 2);
        titleText.y = y + (titleRectHeight / 2) - (titleText.height / 2);
        this.app.stage.addChild(titleText);
    }

    #drawWaitSign() {
        const invisibleRect = new PIXI.Graphics();
        const x = (this.app.screen.width - (this.app.screen.width * this.WAIT_SIGN_WIDTH_TO_SCREEN_WIDTH_SCALE)) / 2;
        const y = (this.app.screen.height - (this.app.screen.height * this.WAIT_SIGN_HEIGHT_TO_SCREEN_HEIGHT_SCALE)) / 2;
        const invisibleRectWidth = this.app.screen.width * this.WAIT_SIGN_WIDTH_TO_SCREEN_WIDTH_SCALE;
        const invisibleRectHeight = this.app.screen.height * this.WAIT_SIGN_HEIGHT_TO_SCREEN_HEIGHT_SCALE;
        invisibleRect.rect(x, y, invisibleRectWidth, invisibleRectHeight);
        invisibleRect.fill(HEX_COLOR_CODES.BLACK);
        this.app.stage.addChild(invisibleRect);

        const fontSize = getFontSize(this.WAIT_SIGN_STRING, invisibleRectWidth, invisibleRectHeight, TEXT_FONT_FAMILY);
        const waitSignText = new PIXI.Text({'text': this.WAIT_SIGN_STRING, 'style': {
            fontFamily: TEXT_FONT_FAMILY,
            fontSize: fontSize,
            fill: HEX_COLOR_CODES.WHITE,
            align: 'center'
        }});
        waitSignText.x = x + (invisibleRectWidth / 2) - (waitSignText.width / 2);
        waitSignText.y = y + (invisibleRectHeight / 2) - (waitSignText.height / 2);
        this.app.stage.addChild(waitSignText);
    }

    /**
     * Draws the lives controls to change the number of lives.
     * @param {Number} controlAreaMaxWidth Max width of the control area.
     * @param {Number} controlAreaLivesOutlineMaxWidth Max width of the lives text and cursor outline.
     * @param {Number} controlAreaLivesOutlineMaxHeight Max height of the lives text and cursor outline.
     */
    #drawLivesControl(controlAreaMaxWidth, controlAreaLivesOutlineMaxWidth, controlAreaLivesOutlineMaxHeight) {
        const livesTextMaxWidth = controlAreaLivesOutlineMaxWidth * this.LIVES_TEXT_WIDTH_TO_INFO_OUTLINE_WIDTH_SCALE;
        const livesTextMaxHeight = controlAreaLivesOutlineMaxHeight;

        // livesText
        const livesString = this.screenContent.options[1] + this.screenContent.optionsValues[1];
        const fontSize = getFontSize(livesString, livesTextMaxWidth, livesTextMaxHeight, TEXT_FONT_FAMILY);
        const livesText = new PIXI.Text({'text': livesString, 'style': {
            fontFamily: TEXT_FONT_FAMILY,
            fontSize: fontSize,
            fill: HEX_COLOR_CODES.WHITE,
            align: 'center'
        }});
        livesText.x = 0;    // x offset added later
        livesText.y = (livesTextMaxHeight - livesText.height) / 2;
        this.app.stage.addChild(livesText);

        // livesCursor bottom
        const livesLowerCursor = new PIXI.Graphics();
        // size of char M for that font size
        const cursorWidth = livesText.width / livesString.length;
        const cursorXOffsetFromText = cursorWidth / 2;
        const cursorGapHeight = livesText.height * this.LIVES_CURSOR_GAP_TO_TEXT_HEIGHT_SCALE;
        
        const leftUpperPoint = {x: livesText.x + livesText.width + cursorXOffsetFromText, y: livesText.y + livesText.height / 2 + cursorGapHeight};
        const rightUpperPoint = {x: leftUpperPoint.x + cursorWidth, y: leftUpperPoint.y};
        const lowerPoint = {x: leftUpperPoint.x + cursorWidth / 2, y: livesText.y + livesText.height};
        livesLowerCursor.poly([leftUpperPoint.x, leftUpperPoint.y, 
                          rightUpperPoint.x, rightUpperPoint.y, 
                          lowerPoint.x, lowerPoint.y]);
        livesLowerCursor.fill(HEX_COLOR_CODES.WHITE);
        this.app.stage.addChild(livesLowerCursor);

        // livesCursor top (same as bottom but opposite y)
        const livesUpperCursor = new PIXI.Graphics();
        const rightLowerPoint = {x: rightUpperPoint.x, y: rightUpperPoint.y - cursorGapHeight};
        const leftLowerPoint = {x: leftUpperPoint.x, y: leftUpperPoint.y - cursorGapHeight};
        const upperPoint = {x: lowerPoint.x, y: livesText.y};
        livesUpperCursor.poly([rightLowerPoint.x, rightLowerPoint.y,
                          leftLowerPoint.x, leftLowerPoint.y,
                          upperPoint.x, upperPoint.y]);
        livesUpperCursor.fill(HEX_COLOR_CODES.WHITE);
        this.app.stage.addChild(livesUpperCursor);
        
        // now add to everythings' x coords to center it in the control area
        const xOffSet = (controlAreaMaxWidth - livesText.width - cursorWidth - cursorXOffsetFromText) / 2;
        livesText.x += xOffSet;
        livesLowerCursor.x += xOffSet;
        livesUpperCursor.x += xOffSet;

        return fontSize;        // for modeText
    }

    /**
     * Draws the mode controls to change between normal and endless mode.
     * @param {Number} fontSize
     * @param {Number} controlAreaMaxWidth
     * @param {Number} controlAreaLivesOutlineMaxWidth
     * @param {Number} controlAreaLivesOutlineMaxHeight 
     */
    #drawModeControl(fontSize, controlAreaMaxWidth, controlAreaLivesOutlineMaxWidth, controlAreaLivesOutlineMaxHeight) {
        const modeTextMaxWidth = controlAreaLivesOutlineMaxWidth * this.LIVES_TEXT_WIDTH_TO_INFO_OUTLINE_WIDTH_SCALE;
        const modeTextMaxHeight = controlAreaLivesOutlineMaxHeight;

        // modeText
        const modeString = this.screenContent.options[0] + '\n' + this.screenContent.optionsValues[0];
        const modeStripped = modeString.replace(/\n/g, '');
        const modeText = new PIXI.Text({'text': modeString, 'style': {
            fontFamily: TEXT_FONT_FAMILY,
            fontSize: fontSize,
            fill: HEX_COLOR_CODES.WHITE,
            align: 'center'
        }});
        const modeStrippedText = new PIXI.Text({'text': modeStripped, 'style': {        // for calculating width of one char
            fontFamily: TEXT_FONT_FAMILY,
            fontSize: fontSize,
            fill: HEX_COLOR_CODES.WHITE,
            align: 'center'
        }});
        modeText.x = this.app.screen.width - controlAreaMaxWidth;       // x offset added later
        modeText.y = (modeTextMaxHeight - modeText.height) / 2;
        this.app.stage.addChild(modeText);

        let cursorWidth = modeStrippedText.width / modeStripped.length;
        const cursorHeight = modeStrippedText.height;
        const cursorXOffsetFromText = cursorWidth / 2;
        const cursorGapWidth = modeStrippedText.height * this.LIVES_CURSOR_GAP_TO_TEXT_HEIGHT_SCALE;
        cursorWidth -= cursorGapWidth;
        
        // modeCursor left
        const modeCursorLeft = new PIXI.Graphics();
        const leftMiddlePoint = {x: modeText.x + modeText.width + cursorXOffsetFromText, y: modeText.y + modeText.height / 2};
        const rightUpperPoint = {x: leftMiddlePoint.x + cursorWidth, y: leftMiddlePoint.y - cursorHeight / 2};
        const rightLowerPoint = {x: rightUpperPoint.x, y: rightUpperPoint.y + cursorHeight};
        modeCursorLeft.poly([leftMiddlePoint.x, leftMiddlePoint.y,
                          rightUpperPoint.x, rightUpperPoint.y,
                          rightLowerPoint.x, rightLowerPoint.y]);
        modeCursorLeft.fill(HEX_COLOR_CODES.WHITE);
        this.app.stage.addChild(modeCursorLeft);

        // modeCursor right
        const modeCursorRight = new PIXI.Graphics();
        const rightMiddlePoint = {x: modeText.x + modeText.width + cursorXOffsetFromText + cursorWidth + cursorGapWidth + cursorWidth, y: modeText.y + modeText.height / 2};
        const leftUpperPoint = {x: rightMiddlePoint.x - cursorWidth, y: rightMiddlePoint.y - cursorHeight / 2};
        const leftLowerPoint = {x: leftUpperPoint.x, y: leftUpperPoint.y + cursorHeight};
        modeCursorRight.poly([rightMiddlePoint.x, rightMiddlePoint.y,
                          leftUpperPoint.x, leftUpperPoint.y,
                          leftLowerPoint.x, leftLowerPoint.y]);
        modeCursorRight.fill(HEX_COLOR_CODES.WHITE);
        this.app.stage.addChild(modeCursorRight);

        // now add to everythings' x coords to center it in the control area
        const xOffSet = (controlAreaMaxWidth - modeText.width - cursorWidth - cursorXOffsetFromText) / 2;
        modeText.x += xOffSet;
        modeCursorLeft.x += xOffSet;
        modeCursorRight.x += xOffSet;
    }


    #drawControls() {
        const controlAreaMaxWidth = this.app.screen.width * this.CONTROL_AREA_WIDTH_TO_SCREEN_WIDTH_SCALE;
        const controlAreaMaxHeight = this.app.screen.height * this.CONTROL_AREA_HEIGHT_TO_SCREEN_HEIGHT_SCALE;

        const controlAreaLivesOutlineMaxWidth = controlAreaMaxWidth * this.CONTROL_AREA_INFO_OUTLINE_WIDTH_TO_CONTROL_AREA_WIDTH_SCALE;
        const controlAreaLivesOutlineMaxHeight = controlAreaMaxHeight;

        const fontSize = this.#drawLivesControl(controlAreaMaxWidth, controlAreaLivesOutlineMaxWidth, controlAreaLivesOutlineMaxHeight);
        this.#drawModeControl(fontSize, controlAreaMaxWidth, controlAreaLivesOutlineMaxWidth, controlAreaLivesOutlineMaxHeight);
    }

    #drawLeaderboards() {
        const ranks = this.screenContent.leaderboards[this.screenContent.optionsValues[0].toLowerCase()][this.screenContent.optionsValues[1]];
        const ranksWidth = this.app.screen.width * this.LEADERBOARD_LINE_WIDTH_TO_SCREEN_WIDTH_SCALE;
        const xOffset = (this.app.screen.width - ranksWidth) / 2;
        const ranksHeight = this.app.screen.height - (this.app.screen.height * this.CONTROL_AREA_HEIGHT_TO_SCREEN_HEIGHT_SCALE);
        const rankHeight = ranksHeight / ((ranks.length + 1) * 2);    // including header and space between ranks
        const rankLabelString = 'Rank';
        const nameLabelString = 'Name';
        const levelLabelString = 'Level';
        const scoreLabelString = 'Score';
        const timeLabelString = 'Time';
        const headerLabels = [rankLabelString, nameLabelString, levelLabelString, scoreLabelString, timeLabelString];
        const longestHeaderLabelString = headerLabels.reduce((a, b) => a.length > b.length ? a : b);
        const rankWidth = ranksWidth / headerLabels.length;
        const rankHeaderFontSize = getFontSize(longestHeaderLabelString, ranksWidth, rankHeight, TEXT_FONT_FAMILY);

        // header
        for (let i = 0; i < headerLabels.length; i++) {
            let headerText = new PIXI.Text({'text': headerLabels[i], 'style': {
                fontFamily: TEXT_FONT_FAMILY,
                fontSize: rankHeaderFontSize,
                fill: HEX_COLOR_CODES.WHITE,
                align: 'center'
            }});
            headerText.x = xOffset + (i * rankWidth) + (rankWidth / 2) - (headerText.width / 2);
            headerText.y = this.app.screen.height * this.CONTROL_AREA_HEIGHT_TO_SCREEN_HEIGHT_SCALE;
            this.app.stage.addChild(headerText);
        }

        // ranks
        for (let i = 0; i < ranks.length; i++) {
            for (let j = 0; j < headerLabels.length; j++) {
                let rankString = j === 0 ? `${i + 1}` : ranks[i][headerLabels[j].toLowerCase()];      // skip rank label as it calculated
                // time parsing
                if (j === 4) {
                    rankString = parseTime(rankString);
                }
                const fontSize = getFontSize(rankString, ranksWidth, rankHeight, TEXT_FONT_FAMILY);
                let rankText = new PIXI.Text({'text': rankString, 'style': {
                    fontFamily: TEXT_FONT_FAMILY,
                    fontSize: fontSize,
                    fill: HEX_COLOR_CODES.WHITE,
                    align: 'center'
                }});
                rankText.x = xOffset + (j * rankWidth) + (rankWidth / 2) - (rankText.width / 2);
                rankText.y = this.app.screen.height * this.CONTROL_AREA_HEIGHT_TO_SCREEN_HEIGHT_SCALE + (i + 1) * 2 * rankHeight;
                this.app.stage.addChild(rankText);
            }
        }
    }

    drawWait() {
        this.#drawBackground();
        this.#drawWaitSign();
    }

    draw() {
        this.#drawBackground();
        this.#drawTitle();
        this.#drawControls();
        this.#drawLeaderboards();
    }

    redraw() {
        this.app.stage.removeChildren();
        this.draw();
        
    }

    cleanUp() {
        this.app.stage.removeChildren();
    }
}

// Leaderboards:
// {"endless":{"0":[{"lives":0,"mode":"endless","name":"203","score":400,"time":16080.68},{"level":10,"lives":0
// /**
//      * Sets up the keys for the leaderboards screen.
//      */
// #setupLeaderboardsKeys() {
//     const changeModeFunc = () => {
//         this.screenContent.optionsValues[0] = this.screenContent.optionsValues[0] === 'Normal' ? 'Endless' : 'Normal';
//         this.soundManager.playCursor();
//         this.screenContent.updated = true;
//     }
    
//     this.keyInputs.up.press = () => {
//         if (!this.keyInputs.down.isDown) {
//             changeModeFunc();
//         }
//     }

//     this.keyInputs.down.press = () => {
//         if (!this.keyInputs.up.isDown) {
//             changeModeFunc();
//         }
//     }

//     const changeLivesFunc = (delta) => {
//         this.screenContent.optionsValues[1] = mod(this.screenContent.optionsValues[1] + delta, 4);
//         this.soundManager.playCursor();
//         this.screenContent.updated = true;
//     }

//     this.keyInputs.left.press = () => {
//         changeLivesFunc(-1);
//     }

//     this.keyInputs.right.press = () => {
//         changeLivesFunc(1);
//     }

//     const returnToMainMenuFunc = () => {
//         this.#cleanUpMenu();
//         this.drawingManager.cleanUp();
//         this.drawingManager = null;
//         this.screenContent = null;
//         this.gameState.switchState(GAME_STATES.MAIN_MENU);
//         this.soundManager.playCursorSubmit();
//     }

//     this.keyInputs.enter.press = () => {
//         returnToMainMenuFunc();
//     }

//     this.keyInputs.escape.press = () => {
//         returnToMainMenuFunc();
//     }
// }

// /**
//  * Initializes the leaderboards.
//  */
// #initLeaderboards() {
//     this.screenContent = JSON.parse(JSON.stringify(DEFAULT_LEADERBOARDS_CONTENT));
//     $.ajax({
//         url: "/api/scores",
//         type: "GET",
//         success: (response) => {
//             console.log(MODULE_NAME_PREFIX, 'Leaderboards:', response);
//             this.screenContent.leaderboards = response;
//             this.screenContent.ready = true;
//         },
//         error: (xhr, status, error) => {
//             console.error(MODULE_NAME_PREFIX, 'Error:', error);
//         }
//     });

//     this.#setupLeaderboardsKeys();
// }

// /**
//  * Handles updating the leaderboards.
//  */
// #handleLeaderboardsUpdate() {
//     if (this.screenContent === null) {
//         this.#initLeaderboards();
//     }
//     if (this.drawingManager === null) {
//         this.drawingManager = new LeaderboardsDrawingManager(this.app, this.textures, this.screenContent);
        
//         // if the leaderboards are not ready, draw the wait screen
//         if (!this.screenContent.ready) {
//             this.drawingManager.drawWait();
//         }
//     }

//     // if the leaderboards are ready, draw them
//     if (this.screenContent.ready && !this.screenContent.updated) {
//         this.drawingManager.draw();
//         this.screenContent.updated = false;
//     }

//     // if the leaderboards are ready and updated, redraw them
//     if (this.screenContent.ready && this.screenContent.updated) {
//         this.drawingManager.redraw();
//         this.screenContent.updated = false;
//     }
// }