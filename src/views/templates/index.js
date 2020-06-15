const {createBadQueryMessageRenderer} = require('./bad-query-message-template');
const {createFeedbackLinkRenderer} = require('./feedback-link-template');
const {createHelpMessageRenderer} = require('./help-message-template');
const {createJobMessageRenderer} = require('./job-message-template');
const {createMenuKeyboardRenderer} = require('./menu-keyboard-template');
const {createNewUserMessageRenderer} = require('./new-user-message-template');
const {createNoUpdatesMessageRenderer} = require('./no-updates-message-template');
const {createTagsKeyboardRenderer} = require('./tags-keyboard-template');
const {createTagsNotSavedMessageRenderer} = require('./tags-not-saved-message-template');
const {createTagsSavedMessageRenderer} = require('./tags-saved-message-template');
const {createUnknownUserMessageRenderer} = require('./unknown-user-message-template');
const {createUserExistMessageRenderer} = require('./user-exist-message-template');

module.exports = {
    createBadQueryMessageRenderer,
    createFeedbackLinkRenderer,
    createHelpMessageRenderer,
    createJobMessageRenderer,
    createMenuKeyboardRenderer,
    createNewUserMessageRenderer,
    createNoUpdatesMessageRenderer,
    createTagsKeyboardRenderer,
    createTagsNotSavedMessageRenderer,
    createTagsSavedMessageRenderer,
    createUnknownUserMessageRenderer,
    createUserExistMessageRenderer
};
