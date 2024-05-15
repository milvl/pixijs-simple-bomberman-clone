const module_name_prefix = "drawing_manager.js - ";

const HEX_COLOR_CODES = {
    RED: 0xFF0000,
    GREEN: 0x00FF00,
    BLUE: 0x0000FF,
    YELLOW: 0xFFFF00,
    WHITE: 0xFFFFFF,
    BLACK: 0x000001
};

const TEXT_RECT_RADIUS = 15;
const TEXT_RECT_FONT_SIZE_SCALE = 1/2;

/**
 * Returns a string with a safe margin around it.
 * @param {String} text - The text to display.
 * @returns {String} The text with a safe margin around it.
 */
function getStringWithSafeMargin(text) {
    return '  ' + text + '  ';
}

/**
     * Returns a PIXI.Text object with the text centered in a rectangle.
     * @param {String} text - The text to display.
     * @param {Number} x - The x-coordinate of the rectangle.
     * @param {Number} y - The y-coordinate of the rectangle.
     * @param {Number} logoRectWidth - The width of the rectangle.
     * @param {Number} logoRectHeight - The height of the rectangle.
     * @returns {PIXI.Text} The PIXI.Text object.
     */
function getBespokeRectText(text, x, y, logoRectWidth, logoRectHeight) {
    let logoText = new PIXI.Text(text, {
        fontFamily: 'Arial',
        fontSize: logoRectHeight * TEXT_RECT_FONT_SIZE_SCALE,
        fill: HEX_COLOR_CODES.BLACK,  // text color
        align: 'center'
    });
    while (logoText.width > logoRectWidth) {
        logoText.style.fontSize -= 1;   // decrease font size until it fits (expects small num of iterations)
    }

    logoText.x = x + (logoRectWidth / 2) - (logoText.width / 2);  // center text horizontally
    logoText.y = y + (logoRectHeight / 2) - (logoText.height / 2);  // center text vertically

    return logoText;
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
     * @param {Object} sprites - The sprites object.
     * @param {Object} screenContent - The screen content object.
     */
    constructor(app, sprites, screenContent) {
        this.app = app;
        this.sprites = sprites;
        this.screenContent = screenContent;
    }

    /**
     * Draws the background of the main menu.
     * // TODO - add background image
     */
    #drawBackground() {
        const background = new PIXI.Graphics();
        background.beginFill(HEX_COLOR_CODES.BLACK);
        background.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
        background.endFill();
        this.app.stage.addChild(background);
    }

    /**
     * Draws the logo of the main menu.
     * // TODO - add logo image
     */
    #drawLogo() {
        // now use simple text
        let logoString = getStringWithSafeMargin(this.LOGO_TEXT_STRING);
        let logoRect = new PIXI.Graphics();
        let x = (this.app.screen.width - (this.app.screen.width * this.LOGO_WIDTH_SCALE)) / 2;
        let y = this.app.screen.height * this.LOGO_Y_OFFSET_SCALE;
        let logoRectWidth = this.app.screen.width * this.LOGO_WIDTH_SCALE;
        let logoRectHeight = this.app.screen.height * this.LOGO_HEIGHT_SCALE;
        logoRect.beginFill(HEX_COLOR_CODES.WHITE);
        logoRect.drawRoundedRect(x, 
                                 y, 
                                 logoRectWidth,
                                 logoRectHeight,
                                 this.TEXT_RECT_RADIUS);
        logoRect.endFill();
        this.app.stage.addChild(logoRect);

        // text
        let logoText = getBespokeRectText(logoString, x, y, logoRectWidth, logoRectHeight);
        this.app.stage.addChild(logoText);
    }

    /**
     * Draws the buttons of the main menu.
     */
    #drawButtons() {
        let x = (this.app.screen.width - this.app.screen.width * this.BUTTON_WIDTH_SCALE) / 2;
        let button_width = this.app.screen.width * this.BUTTON_WIDTH_SCALE;
        let button_height = this.app.screen.height * this.BUTTON_HEIGHT_SCALE;
        for (let i = 0; i < this.screenContent.options.length; i++) {
            let offset_from_logo = this.app.screen.height * this.LOGO_Y_OFFSET_SCALE * 2 + (this.app.screen.height * this.LOGO_HEIGHT_SCALE);
            let y = offset_from_logo + (this.app.screen.height * this.BUTTON_HEIGHT_SCALE * i * 2);
            let button = new PIXI.Graphics();
            button.beginFill(HEX_COLOR_CODES.WHITE);
            button.drawRoundedRect(x, 
                                   y, 
                                   button_width, 
                                   button_height, 
                                   this.TEXT_RECT_RADIUS);
            button.endFill();
            this.app.stage.addChild(button);
            
            // text
            let buttonTextString = getStringWithSafeMargin(this.screenContent.options[i]);
            let buttonText = getBespokeRectText(buttonTextString, x, y, button_width, button_height);
            this.app.stage.addChild(buttonText);

            // add >> << around button if selected
            if (i === this.screenContent.selected) {
                let left_arrow = new PIXI.Graphics();
                left_arrow.beginFill(HEX_COLOR_CODES.WHITE);
                let polygon_points = [x - button_width * this.SELECT_MARKER_MARGIN_TO_BUTTON_SCALE_X,
                                      y + button_height * this.SELECTE_MARKER_LOCATION_TO_BUTTON_SCALE_Y,       // middle of button
                                      x - (2 * button_width * this.SELECT_MARKER_MARGIN_TO_BUTTON_SCALE_X),
                                      y,                                                                        // top of button
                                      x - (2 * button_width * this.SELECT_MARKER_MARGIN_TO_BUTTON_SCALE_X),
                                      y + button_height];                                                       // bottom of button
                left_arrow.drawPolygon(polygon_points);
                left_arrow.endFill();
                this.app.stage.addChild(left_arrow);

                let right_arrow = new PIXI.Graphics();
                right_arrow.beginFill(HEX_COLOR_CODES.WHITE);
                polygon_points = [x + button_width + button_width* this.SELECT_MARKER_MARGIN_TO_BUTTON_SCALE_X,
                                  y + button_height * this.SELECTE_MARKER_LOCATION_TO_BUTTON_SCALE_Y,       // middle of button
                                  x + button_width + (2 * button_width * this.SELECT_MARKER_MARGIN_TO_BUTTON_SCALE_X),
                                  y,                                                                        // top of button
                                  x + button_width + (2 * button_width * this.SELECT_MARKER_MARGIN_TO_BUTTON_SCALE_X),
                                  y + button_height];                                                       // bottom of button
                right_arrow.drawPolygon(polygon_points);
                right_arrow.endFill();
                this.app.stage.addChild(right_arrow);
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
     * @param {Object} sprites - The sprites object.
     * @param {Object} screenContent - The screen content object.
     */
    constructor(app, sprites, screenContent) {
        this.app = app;
        this.sprites = sprites;
        this.screenContent = screenContent;
    }

    /**
     * Draws the background of the settings.
     * // TODO - add background image
     */
    #drawBackground() {
        const background = new PIXI.Graphics();
        background.beginFill(HEX_COLOR_CODES.BLACK);
        background.drawRect(0, 0, this.app.screen.width, this.app.screen.height);
        background.endFill();
        this.app.stage.addChild(background);
    }

    #drawTitle() {
        let titleString = getStringWithSafeMargin(this.TITLE_STRING);
        let titleRect = new PIXI.Graphics();
        let x = (this.app.screen.width - (this.app.screen.width * this.TITLE_WIDTH_SCALE)) / 2;
        let y = this.app.screen.height * this.TITLE_Y_OFFSET_SCALE;
        let titleRectWidth = this.app.screen.width * this.TITLE_WIDTH_SCALE;
        let titleRectHeight = this.app.screen.height * this.TITLE_HEIGHT_SCALE;
        titleRect.beginFill(HEX_COLOR_CODES.WHITE);
        titleRect.drawRoundedRect(x, 
                                  y, 
                                  titleRectWidth,
                                  titleRectHeight,
                                  this.TEXT_RECT_RADIUS);
        titleRect.endFill();
        this.app.stage.addChild(titleRect);

        // text
        let titleText = getBespokeRectText(titleString, x, y, titleRectWidth, titleRectHeight);
        this.app.stage.addChild(titleText);
    }

    /**
     * Returns the font size that fits the text scale.
     * @returns {Number} The font size that fits the text scale.
     */
    #getFontSize() {
        let fontSize = 1;
        let text = new PIXI.Text('M', {
            fontFamily: 'Arial',
            fontSize: fontSize,
            fill: HEX_COLOR_CODES.BLACK,  // text color
        });
        while (text.height < this.app.screen.height * this.OPTIONS_TEXT_HEIGHT_SCALE) {
            fontSize++;
            text.style.fontSize = fontSize;
        }
        while (text.width > this.app.screen.width * this.OPTIONS_TEXT_WIDTH_SCALE) {
            fontSize--;
            text.style.fontSize = fontSize;
        }
        return fontSize;
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

    #drawOptions() {
        let x = (this.app.screen.width - (this.app.screen.width * this.TITLE_WIDTH_SCALE)) / 2;
        let y = undefined;
        let y_title_with_margins = this.app.screen.height * this.TITLE_Y_OFFSET_SCALE * 2 + (this.app.screen.height * this.TITLE_HEIGHT_SCALE);
        let option_text_height = this.app.screen.height * this.OPTIONS_TEXT_HEIGHT_SCALE;
        let option_text_gap = this.app.screen.height * this.OPTIONS_TEXT_GAP_SCALE;

        // find font size fitting text scale
        let fontSize = this.#getFontSize();
        
        for (let i = 0; i < this.screenContent.options.length; i++) {
            y = y_title_with_margins + (option_text_height + option_text_gap) * i;

            let optionString = this.#getFormattedOptionString(this.screenContent.options[i], this.screenContent.options_values[i]);
            optionString = getStringWithSafeMargin(optionString);

            let optionText = new PIXI.Text(optionString, {
                fontFamily: 'Arial',
                fontSize: fontSize,
                fill: HEX_COLOR_CODES.WHITE,  // text color
                align: 'center'
            });

            optionText.x = x;
            optionText.y = y;
            this.app.stage.addChild(optionText);

            if (i === this.screenContent.selected) {
                let right_arrow = new PIXI.Graphics();
                right_arrow.beginFill(HEX_COLOR_CODES.WHITE);
                let x_title_end = x + (this.app.screen.width * this.TITLE_WIDTH_SCALE);
                let polygon_points = [x_title_end,
                                      y,                    // top right of text
                                      x_title_end - option_text_height,
                                      y + option_text_height / 2,  // middle of text
                                      x_title_end,
                                      y + option_text_height];     // bottom right of text

                right_arrow.drawPolygon(polygon_points);
                right_arrow.endFill();
                this.app.stage.addChild(right_arrow);
            }
        }
    }

    /**
     * Draws the main menu.
     */
    draw() {
        this.#drawBackground();
        this.#drawTitle();
        this.#drawOptions();
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