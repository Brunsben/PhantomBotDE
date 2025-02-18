/*
 * Copyright (C) 2016-2020 phantom.bot
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

(function() {
    var permitList = [],
        timeouts = [],
        whiteList = [],
        blackList = [],
        spamTracker = {},

        linksToggle = $.getSetIniDbBoolean('chatModerator', 'linksToggle', false),
        linksMessage = $.getSetIniDbString('chatModerator', 'linksMessage', 'Du wurdest für das Posten eines Links bestraft.'),
        linkPermitTime = $.getSetIniDbNumber('chatModerator', 'linkPermitTime', 30),

        capsToggle = $.getSetIniDbBoolean('chatModerator', 'capsToggle', false),
        capsMessage = $.getSetIniDbString('chatModerator', 'capsMessage', 'Du wurdest für das Überstrapazieren der Caps funktion bestraft.'),
        capsLimitPercent = $.getSetIniDbFloat('chatModerator', 'capsLimitPercent', 70),
        capsTriggerLength = $.getSetIniDbNumber('chatModerator', 'capsTriggerLength', 20),

        spamToggle = $.getSetIniDbBoolean('chatModerator', 'spamToggle', false),
        spamMessage = $.getSetIniDbString('chatModerator', 'spamMessage', 'Du wurdest fürs spammen bestraft.'),
        spamLimit = $.getSetIniDbNumber('chatModerator', 'spamLimit', 15),

        symbolsToggle = $.getSetIniDbBoolean('chatModerator', 'symbolsToggle', false),
        symbolsMessage = $.getSetIniDbString('chatModerator', 'symbolsMessage', 'Du wurdest bestraft weil du zu viele Symbolen benutzt.'),
        symbolsLimitPercent = $.getSetIniDbFloat('chatModerator', 'symbolsLimitPercent', 50),
        symbolsGroupLimit = $.getSetIniDbFloat('chatModerator', 'symbolsGroupLimit', 10),
        symbolsTriggerLength = $.getSetIniDbNumber('chatModerator', 'symbolsTriggerLength', 20),

        emotesToggle = $.getSetIniDbBoolean('chatModerator', 'emotesToggle', false),
        emotesMessage = $.getSetIniDbString('chatModerator', 'emotesMessage', 'Du wurdest bestraft weil du zu viele Emotes benutzt.'),
        emotesLimit = $.getSetIniDbNumber('chatModerator', 'emotesLimit', 5),

        longMessageToggle = $.getSetIniDbBoolean('chatModerator', 'longMessageToggle', false),
        longMessageMessage = $.getSetIniDbString('chatModerator', 'longMessageMessage',  'Du wurdest bestraft weil deine Nachricht zu lang war.'),
        longMessageLimit = $.getSetIniDbNumber('chatModerator', 'longMessageLimit', 325),

        colorsToggle = $.getSetIniDbBoolean('chatModerator', 'colorsToggle', false),
        colorsMessage = $.getSetIniDbString('chatModerator', 'colorsMessage', 'Du wurdest bestraft weil du farbig schreibst.'),

        spamTrackerToggle = $.getSetIniDbBoolean('chatModerator', 'spamTrackerToggle', false),
        spamTrackerMessage = $.getSetIniDbString('chatModerator', 'spamTrackerMessage',  'Du wurdest für das Spammen bestraft.'),
        spamTrackerTime = $.getSetIniDbNumber('chatModerator', 'spamTrackerTime', 30),
        spamTrackerLimit = $.getSetIniDbNumber('chatModerator', 'spamTrackerLimit', 30),

        blacklistTimeoutTime = $.getSetIniDbNumber('chatModerator', 'blacklistTimeoutTime', 600),
        blacklistMessage = $.getSetIniDbString('chatModerator', 'blacklistMessage', 'Du wurdest bestraft weil du etwas verbotenes geschrieben hast.'),
        blacklistMessageBan = $.getSetIniDbString('chatModerator', 'blacklistMessageBan', 'Du wurdest gebannt weil du etwas verbotenes geschrieben hast.'),

        fakePurgeToggle = $.getSetIniDbBoolean('chatModerator', 'fakePurgeToggle', false),
        fakePurgeMessage = $.getSetIniDbString('chatModerator', 'fakePurgeMessage',  'Du wurdest bestraft weil du einen Timeout vorgetäuscht hast.'),

        subscribers = {
            Links: $.getSetIniDbBoolean('chatModerator', 'subscribersModerateLinks', true),
            Caps: $.getSetIniDbBoolean('chatModerator', 'subscribersModerateCaps', true),
            Symbols: $.getSetIniDbBoolean('chatModerator', 'subscribersModerateSymbols', true),
            Spam: $.getSetIniDbBoolean('chatModerator', 'subscribersModerateSpam', true),
            Emotes: $.getSetIniDbBoolean('chatModerator', 'subscribersModerateEmotes', true),
            Colors: $.getSetIniDbBoolean('chatModerator', 'subscribersModerateColors', true),
            LongMsg: $.getSetIniDbBoolean('chatModerator', 'subscribersModerateLongMsg', true),
            SpamTracker: $.getSetIniDbBoolean('chatModerator', 'subscribersModerateSpamTracker', true),
            FakePurge: $.getSetIniDbBoolean('chatModerator', 'subscribersModerateFakePurge', true),
        },

        regulars = {
            Links: $.getSetIniDbBoolean('chatModerator', 'regularsModerateLinks', true),
            Caps: $.getSetIniDbBoolean('chatModerator', 'regularsModerateCaps', true),
            Symbols: $.getSetIniDbBoolean('chatModerator', 'regularsModerateSymbols', true),
            Spam: $.getSetIniDbBoolean('chatModerator', 'regularsModerateSpam', true),
            Emotes: $.getSetIniDbBoolean('chatModerator', 'regularsModerateEmotes', true),
            Colors: $.getSetIniDbBoolean('chatModerator', 'regularsModerateColors', true),
            LongMsg: $.getSetIniDbBoolean('chatModerator', 'regularsModerateLongMsg', true),
            SpamTracker: $.getSetIniDbBoolean('chatModerator', 'regularsModerateSpamTracker', true),
            FakePurge: $.getSetIniDbBoolean('chatModerator', 'regularsModerateFakePurge', true),
        },

        silentTimeout = {
            Links: $.getSetIniDbBoolean('chatModerator', 'silentTimeoutLinks', false),
            Caps: $.getSetIniDbBoolean('chatModerator', 'silentTimeoutCaps', false),
            Symbols: $.getSetIniDbBoolean('chatModerator', 'silentTimeoutSymbols', false),
            Spam: $.getSetIniDbBoolean('chatModerator', 'silentTimeoutSpam', false),
            Emotes: $.getSetIniDbBoolean('chatModerator', 'silentTimeoutEmotes', false),
            Colors: $.getSetIniDbBoolean('chatModerator', 'silentTimeoutColors', false),
            LongMsg: $.getSetIniDbBoolean('chatModerator', 'silentTimeoutLongMsg', false),
            Blacklist: $.getSetIniDbBoolean('chatModerator', 'silentTimeoutBlacklist', false),
            SpamTracker: $.getSetIniDbBoolean('chatModerator', 'silentTimeoutSpamTracker', false),
            FakePurge: $.getSetIniDbBoolean('chatModerator', 'silentTimeoutFakePurge', false),
            LinkMessage: $.getSetIniDbString('chatModerator', 'silentLinkMessage', 'Posten von Links ohne Erlaubnis. (Automated by ' + $.botName + ')'),
            SpamMessage: $.getSetIniDbString('chatModerator', 'silentSpamMessage', 'Übermäßige Verwendung von sich wiederholenden Zeichen. (Automated by ' + $.botName + ')'),
            CapMessage: $.getSetIniDbString('chatModerator', 'silentCapMessage', 'Übermäßige Verwendung von Caps. (Automated by ' + $.botName + ')'),
            SymbolMessage: $.getSetIniDbString('chatModerator', 'silentSymbolsMessage', 'Übermäßige Verwendung von Symbolen. (Automated by ' + $.botName + ')'),
            ColorMessage: $.getSetIniDbString('chatModerator', 'silentColorMessage', 'Verwenden von farbigem Text. (Automated by ' + $.botName + ')'),
            EmoteMessage: $.getSetIniDbString('chatModerator', 'silentEmoteMessage', 'Übermäßiger Gebrauch von Emotes. (Automated by ' + $.botName + ')'),
            LongMessage: $.getSetIniDbString('chatModerator', 'silentLongMessage', 'Übermäßige Nachrichtenlänge. (Automated by ' + $.botName + ')'),
            BlacklistMessage: $.getSetIniDbString('chatModerator', 'silentBlacklistMessage', 'Verwendung einer Phrase von der Verbotsliste. (Automated by ' + $.botName + ')'),
            SpamTrackerMessage: $.getSetIniDbString('chatModerator', 'silentSpamTrackerMessage', 'Chat spammen. (Automated by ' + $.botName + ')'),
            FakePurgeMessage: $.getSetIniDbString('chatModerator', 'silentFakePurgeMessage', 'Fake purge. (Automated by ' + $.botName + ')'),
        },

        warningTime = {
            Links: $.getSetIniDbNumber('chatModerator', 'warningTimeLinks', 5),
            Caps: $.getSetIniDbNumber('chatModerator', 'warningTimeCaps', 5),
            Symbols: $.getSetIniDbNumber('chatModerator', 'warningTimeSymbols', 5),
            Spam: $.getSetIniDbNumber('chatModerator', 'warningTimeSpam', 5),
            Emotes: $.getSetIniDbNumber('chatModerator', 'warningTimeEmotes', 5),
            Colors: $.getSetIniDbNumber('chatModerator', 'warningTimeColors', 5),
            LongMsg: $.getSetIniDbNumber('chatModerator', 'warningTimeLongMsg', 5),
            SpamTracker: $.getSetIniDbNumber('chatModerator', 'warningTimeSpamTracker', 5),
            FakePurge: $.getSetIniDbNumber('chatModerator', 'warningTimeFakePurge', 5),
        },

        timeoutTime = {
            Links: $.getSetIniDbNumber('chatModerator', 'timeoutTimeLinks', 600),
            Caps: $.getSetIniDbNumber('chatModerator', 'timeoutTimeCaps', 600),
            Symbols: $.getSetIniDbNumber('chatModerator', 'timeoutTimeSymbols', 600),
            Spam: $.getSetIniDbNumber('chatModerator', 'timeoutTimeSpam', 600),
            Emotes: $.getSetIniDbNumber('chatModerator', 'timeoutTimeEmotes', 600),
            Colors: $.getSetIniDbNumber('chatModerator', 'timeoutTimeColors', 600),
            LongMsg: $.getSetIniDbNumber('chatModerator', 'timeoutTimeLongMsg', 600),
            SpamTracker: $.getSetIniDbNumber('chatModerator', 'timeoutTimeSpamTracker', 600),
            FakePurge: $.getSetIniDbNumber('chatModerator', 'timeoutTimeFakePurge', 600),
        },

        moderationLogs = $.getSetIniDbBoolean('chatModerator', 'moderationLogs', false),
        msgCooldownSec = $.getSetIniDbNumber('chatModerator', 'msgCooldownSecs', 45),
        warningResetTime = $.getSetIniDbNumber('chatModerator', 'warningResetTime', 60),
        resetTime = (warningResetTime * 6e4),
        messageTime = $.systemTime(),
        warning = '',
        youtubeLinks = new RegExp('(youtube.com|youtu.be)', 'i'),
        i,
        j,
        k;

    /**
     * @function reloadModeration
     * To be called by the panel to update the chatmod settings after updating the DB directly.
     */
    function reloadModeration() {
        linksToggle = $.getIniDbBoolean('chatModerator', 'linksToggle');
        linksMessage = $.getIniDbString('chatModerator', 'linksMessage');
        linkPermitTime = $.getIniDbNumber('chatModerator', 'linkPermitTime');

        capsToggle = $.getIniDbBoolean('chatModerator', 'capsToggle');
        capsMessage = $.getIniDbString('chatModerator', 'capsMessage');
        capsLimitPercent = $.getIniDbFloat('chatModerator', 'capsLimitPercent');
        capsTriggerLength = $.getIniDbNumber('chatModerator', 'capsTriggerLength');

        spamToggle = $.getIniDbBoolean('chatModerator', 'spamToggle');
        spamMessage = $.getIniDbString('chatModerator', 'spamMessage');
        spamLimit = $.getIniDbNumber('chatModerator', 'spamLimit');

        symbolsToggle = $.getIniDbBoolean('chatModerator', 'symbolsToggle');
        symbolsMessage = $.getIniDbString('chatModerator', 'symbolsMessage');
        symbolsLimitPercent = $.getIniDbFloat('chatModerator', 'symbolsLimitPercent');
        symbolsGroupLimit = $.getIniDbFloat('chatModerator', 'symbolsGroupLimit');
        symbolsTriggerLength = $.getIniDbNumber('chatModerator', 'symbolsTriggerLength');

        emotesToggle = $.getIniDbBoolean('chatModerator', 'emotesToggle');
        emotesMessage = $.getIniDbString('chatModerator', 'emotesMessage');
        emotesLimit = $.getIniDbNumber('chatModerator', 'emotesLimit');

        longMessageToggle = $.getIniDbBoolean('chatModerator', 'longMessageToggle');
        longMessageMessage = $.getIniDbString('chatModerator', 'longMessageMessage');
        longMessageLimit = $.getIniDbNumber('chatModerator', 'longMessageLimit');

        colorsToggle = $.getIniDbBoolean('chatModerator', 'colorsToggle');
        colorsMessage = $.getIniDbString('chatModerator', 'colorsMessage');

        spamTrackerToggle = $.getIniDbBoolean('chatModerator', 'spamTrackerToggle');
        spamTrackerMessage = $.getIniDbString('chatModerator', 'spamTrackerMessage');
        spamTrackerTime = $.getIniDbNumber('chatModerator', 'spamTrackerTime');
        spamTrackerLimit = $.getIniDbNumber('chatModerator', 'spamTrackerLimit');

        fakePurgeToggle = $.getSetIniDbBoolean('chatModerator', 'fakePurgeToggle');
        fakePurgeMessage = $.getSetIniDbString('chatModerator', 'fakePurgeMessage');

        subscribers = {
            Links: $.getIniDbBoolean('chatModerator', 'subscribersModerateLinks'),
            Caps: $.getIniDbBoolean('chatModerator', 'subscribersModerateCaps'),
            Symbols: $.getIniDbBoolean('chatModerator', 'subscribersModerateSymbols'),
            Spam: $.getIniDbBoolean('chatModerator', 'subscribersModerateSpam'),
            Emotes: $.getIniDbBoolean('chatModerator', 'subscribersModerateEmotes'),
            Colors: $.getIniDbBoolean('chatModerator', 'subscribersModerateColors'),
            LongMsg: $.getIniDbBoolean('chatModerator', 'subscribersModerateLongMsg'),
            SpamTracker: $.getIniDbBoolean('chatModerator', 'subscribersModerateSpamTracker'),
            FakePurge: $.getSetIniDbBoolean('chatModerator', 'subscribersModerateFakePurge')
        };

        regulars = {
            Links: $.getIniDbBoolean('chatModerator', 'regularsModerateLinks'),
            Caps: $.getIniDbBoolean('chatModerator', 'regularsModerateCaps'),
            Symbols: $.getIniDbBoolean('chatModerator', 'regularsModerateSymbols'),
            Spam: $.getIniDbBoolean('chatModerator', 'regularsModerateSpam'),
            Emotes: $.getIniDbBoolean('chatModerator', 'regularsModerateEmotes'),
            Colors: $.getIniDbBoolean('chatModerator', 'regularsModerateColors'),
            LongMsg: $.getIniDbBoolean('chatModerator', 'regularsModerateLongMsg'),
            SpamTracker: $.getIniDbBoolean('chatModerator', 'regularsModerateSpamTracker'),
            FakePurge: $.getSetIniDbBoolean('chatModerator', 'regularsModerateFakePurge')
        };

        silentTimeout = {
            Links: $.getIniDbBoolean('chatModerator', 'silentTimeoutLinks'),
            Caps: $.getIniDbBoolean('chatModerator', 'silentTimeoutCaps'),
            Symbols: $.getIniDbBoolean('chatModerator', 'silentTimeoutSymbols'),
            Spam: $.getIniDbBoolean('chatModerator', 'silentTimeoutSpam'),
            Emotes: $.getIniDbBoolean('chatModerator', 'silentTimeoutEmotes'),
            Colors: $.getIniDbBoolean('chatModerator', 'silentTimeoutColors'),
            LongMsg: $.getIniDbBoolean('chatModerator', 'silentTimeoutLongMsg'),
            Blacklist: $.getIniDbBoolean('chatModerator', 'silentTimeoutBlacklist'),
            SpamTracker: $.getIniDbBoolean('chatModerator', 'silentSpamTracker'),
            FakePurge: $.getSetIniDbBoolean('chatModerator', 'silentTimeoutFakePurge'),
            LinkMessage: $.getIniDbString('chatModerator', 'silentLinkMessage'),
            SpamMessage: $.getIniDbString('chatModerator', 'silentSpamMessage'),
            CapMessage: $.getIniDbString('chatModerator', 'silentCapMessage'),
            SymbolMessage: $.getIniDbString('chatModerator', 'silentSymbolsMessage'),
            ColorMessage: $.getIniDbString('chatModerator', 'silentColorMessage'),
            EmoteMessage: $.getIniDbString('chatModerator', 'silentEmoteMessage'),
            LongMessage: $.getIniDbString('chatModerator', 'silentLongMessage'),
            BlacklistMessage: $.getIniDbString('chatModerator', 'silentBlacklistMessage'),
            SpamTrackerMessage: $.getIniDbString('chatModerator', 'silentSpamTrackerMessage'),
            FakePurgeMessage: $.getSetIniDbString('chatModerator', 'silentFakePurgeMessage')
        };

        warningTime = {
            Links: $.getIniDbNumber('chatModerator', 'warningTimeLinks'),
            Caps: $.getIniDbNumber('chatModerator', 'warningTimeCaps'),
            Symbols: $.getIniDbNumber('chatModerator', 'warningTimeSymbols'),
            Spam: $.getIniDbNumber('chatModerator', 'warningTimeSpam'),
            Emotes: $.getIniDbNumber('chatModerator', 'warningTimeEmotes'),
            Colors: $.getIniDbNumber('chatModerator', 'warningTimeColors'),
            LongMsg: $.getIniDbNumber('chatModerator', 'warningTimeLongMsg'),
            SpamTracker: $.getIniDbNumber('chatModerator', 'warningTimeSpamTracker'),
            FakePurge: $.getSetIniDbNumber('chatModerator', 'warningTimeFakePurge')
        };

        timeoutTime = {
            Links: $.getIniDbNumber('chatModerator', 'timeoutTimeLinks'),
            Caps: $.getIniDbNumber('chatModerator', 'timeoutTimeCaps'),
            Symbols: $.getIniDbNumber('chatModerator', 'timeoutTimeSymbols'),
            Spam: $.getIniDbNumber('chatModerator', 'timeoutTimeSpam'),
            Emotes: $.getIniDbNumber('chatModerator', 'timeoutTimeEmotes'),
            Colors: $.getIniDbNumber('chatModerator', 'timeoutTimeColors'),
            LongMsg: $.getIniDbNumber('chatModerator', 'timeoutTimeLongMsg'),
            SpamTracker: $.getIniDbNumber('chatModerator', 'timeoutTimeSpamTracker'),
            FakePurge: $.getSetIniDbNumber('chatModerator', 'timeoutTimeFakePurge')
        };

        blacklistMessage = $.getIniDbString('chatModerator', 'blacklistMessage');
        blacklistMessageBan = $.getIniDbString('chatModerator', 'blacklistMessageBan');
        warningResetTime = $.getIniDbNumber('chatModerator', 'warningResetTime');
        msgCooldownSec = $.getIniDbNumber('chatModerator', 'msgCooldownSecs');
        resetTime = (warningResetTime * 6e4);

        loadBlackList();
        loadWhiteList();
    }

    /*
     * @interval
     */
    setInterval(function() {
        var keys,
            i;

        if (spamTracker.length !== 0) {
            keys = Object.keys(spamTracker);

            for (i in keys) {
                if (spamTracker[keys[i]].time < $.systemTime()) {
                    delete spamTracker[keys[i]];
                }
            }
        }

        if (timeouts.length !== 0) {
            keys = Object.keys(timeouts);

            for (i in keys) {
                if (timeouts[keys[i]] < $.systemTime()) {
                    delete timeouts[keys[i]];
                }
            }
        }
    }, 8e4, 'scripts::core::chatModerator.js');

    /**
     * @function loadBlackList
     */
    function loadBlackList() {
        var keys = $.inidb.GetKeyList('blackList', '');
            blackList = [];

        for (i = 0; i < keys.length; i++) {
            var json = JSON.parse($.inidb.get('blackList', keys[i]));

            if (json != null) {
                if (json.isRegex) {
                    try {
                        json.phrase = new RegExp(json.phrase.replace('regex:', ''));
                    } catch (ex) {
                        // Failed to create regex, ignore this and don't make it a blacklist.
                        continue;
                    }
                } else {
                    json.phrase = json.phrase.toLowerCase();
                }
                json.isBan = parseInt(json.timeout) === -1;

                blackList.push(json);
            }
        }
    }

    /**
     * @function loadWhiteList
     */
    function loadWhiteList() {
        var keys = $.inidb.GetKeyList('whiteList', '');
            whiteList = [];

        for (i = 0; i < keys.length; i++) {
            whiteList.push(keys[i] + '');
        }
    }

    /**
     * @function timeoutUserFor
     *
     * @param {string} username
     * @param {number} time
     * @param {string} reason
     * @param {map} tags
     */
    function timeoutUserFor(username, time, reason, tags) {
        if (time == 0) {
            $.session.sayNow('.delete ' + tags.get('id')); // Cannot send a reason/time with this.
        } else {
            $.session.sayNow('.timeout ' + username + ' ' + time + ' ' + reason);
        }
    }

    /*
     * @function banUser
     *
     * @param {string} username
     * @param {string} reason
     */
    function banUser(username, reason) {
        $.session.sayNow('.ban ' + username + ' ' + reason);
    }

    /**
     * @function timeout
     *
     * @param {string} username
     * @param {number} warningT
     * @param {number} timeoutT
     * @param {string} reason
     * @param {map} tags
     */
    function timeout(username, warningT, timeoutT, reason, tags) {
        if (timeouts[username] !== undefined) {
            if (timeouts[username] > $.systemTime()) {
                timeoutUserFor(username, timeoutT, reason, tags);
                warning = $.lang.get('chatmoderator.timeout');
            } else {
                timeoutUserFor(username, warningT, reason, tags);
                warning = $.lang.get('chatmoderator.warning');
            }
        } else {
            timeoutUserFor(username, warningT, reason, tags);
            warning = $.lang.get('chatmoderator.warning');
        }
        timeouts[username] = ($.systemTime() + resetTime);
    }

    /**
     * @function sendMessage
     *
     * @param {string} username
     * @param {string} message
     * @param {boolean} filter
     */
    function sendMessage(username, message, filter) {
        if (filter == false && messageTime < $.systemTime() && $.getMessageWrites() < 7) {
            $.session.sayNow('@' + username + ', ' + message + ' ' + warning);
            messageTime = ((msgCooldownSec * 1000) + $.systemTime());
        }
    }

    /**
     * @function permitUser
     *
     * @param {string} username
     */
    function permitUser(username) {
        permitList[username] = ((linkPermitTime * 1000) + $.systemTime());
    }

    /**
     * @function getModerationFilterStatus
     *
     * @param {string} filter
     * @param {boolean} toggle
     */
    function getModerationFilterStatus(filter, toggle) {
        if (toggle) {
            return (filter ? $.lang.get('common.enabled') : $.lang.get('common.disabled'));
        } else {
            return (filter ? 'not allowed' : 'allowed');
        }
    }

    /**
     * @function checkPermitList
     *
     * @param {string} username
     */
    function checkPermitList(username) {
        if (permitList[username] !== undefined) {
            if (permitList[username] > $.systemTime()) {
                delete permitList[username];
                return true;
            }
        }
        return false;
    }

    /**
     * @function checkBlackList
     *
     * @param {string} sender
     * @param {string} message
     * @param {map} tags
     */
    function checkBlackList(sender, event, message, tags) {
        for (i in blackList) {
            if (blackList[i].isRegex) {
                if (blackList[i].phrase.test(message)) {
                    if (blackList[i].excludeRegulars && $.isReg(sender) || blackList[i].excludeSubscribers && $.isSubv3(sender, event.getTags())) {
                        return false;
                    }

                    if (blackList[i].isBan) {
                        banUser(sender, blackList[i].banReason);
                        warning = $.lang.get('chatmoderator.ban');
                        sendMessage(sender, blackList[i].message, blackList[i].isSilent);
                    } else {
                        timeoutUserFor(sender, blackList[i].timeout, blackList[i].banReason, tags);
                        warning = $.lang.get('chatmoderator.timeout');
                        sendMessage(sender, blackList[i].message, blackList[i].isSilent);
                    }
                    return true;
                }
            } else {
                if (message.indexOf(blackList[i].phrase) !== -1) {
                    if (blackList[i].excludeRegulars && $.isReg(sender) || blackList[i].excludeSubscribers && $.isSubv3(sender, event.getTags())) {
                        return false;
                    }

                    if (blackList[i].isBan) {
                        banUser(sender, blackList[i].banReason);
                        warning = $.lang.get('chatmoderator.ban');
                        sendMessage(sender, blackList[i].message, blackList[i].isSilent);
                    } else {
                        timeoutUserFor(sender, blackList[i].timeout, blackList[i].banReason, tags);
                        warning = $.lang.get('chatmoderator.timeout');
                        sendMessage(sender, blackList[i].message, blackList[i].isSilent);
                    }
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * @function checkWhiteList
     *
     * @param {string} message
     */
    function checkWhiteList(message) {
        function checkLink(link, whiteListItem) {
            var baseLink = link.match(/[^.]*[^/]*/)[0];
            var itemRe = new RegExp(whiteListItem.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
            var matches = $.matchAll(link, itemRe);
            for (k = 0; k < matches.length; k++) {
                var matchStart = matches[k].index;
                var matchEnd = matches[k].index + matches[k][0].length;
                if (matchStart < baseLink.length && matchEnd >= baseLink.length) {
                    return true;
                }
            }
            return false;
        }

        var links = $.patternDetector.getLinks(message);
        for (i = 0; i < whiteList.length; i++) {
            for (j = 0; j < links.length; j++) {
                if (checkLink(links[j], whiteList[i])) {
                    links.splice(j--, 1);
                }
            }
            if (links.length === 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * @function checkYoutubePlayer
     *
     * @param {string} message
     */
    function checkYoutubePlayer(message) {
        if ($.youtubePlayerConnected && youtubeLinks.test(message)) {
            return true;
        }
        return false;
    }

    /**
     * @function performModeration
     */
    function performModeration(event) {
        var sender = event.getSender(),
            message = event.getMessage().toLowerCase(),
            messageLength = message.length(),
            tags = event.getTags();

        if (!$.isModv3(sender, tags)) {
            // Blacklist
            if (checkBlackList(sender, event, message, tags)) {
                return;
            }

            // Links filter
            if (linksToggle && $.patternDetector.hasLinks(event)) {
                if (checkYoutubePlayer(message) || checkPermitList(sender) || checkWhiteList(message)) {
                    return;
                } else if (!regulars.Links && $.isReg(sender) || !subscribers.Links && $.isSubv3(sender, event.getTags())) {
                    return;
                }

                timeout(sender, warningTime.Links, timeoutTime.Links, silentTimeout.LinkMessage, tags);
                sendMessage(sender, linksMessage, silentTimeout.Links);
                $.patternDetector.logLastLink(event);
                return;
            }

            // Symbol filter
            if (symbolsToggle && messageLength >= symbolsTriggerLength) {
                if ($.patternDetector.getLongestNonLetterSequence(event) >= symbolsGroupLimit || (($.patternDetector.getNumberOfNonLetters(event) / messageLength) * 100) >= symbolsLimitPercent) {
                    if (!regulars.Symbols && $.isReg(sender) || !subscribers.Symbols && $.isSubv3(sender, event.getTags())) {
                        return;
                    }

                    timeout(sender, warningTime.Symbols, timeoutTime.Symbols, silentTimeout.SymbolMessage, tags);
                    sendMessage(sender, symbolsMessage, silentTimeout.Symbols);
                    return;
                }
            }

            // Spam filter
            if (spamToggle && $.patternDetector.getLongestRepeatedSequence(event) >= spamLimit) {
                if (!regulars.Spam && $.isReg(sender) || !subscribers.Spam && $.isSubv3(sender, event.getTags())) {
                    return;
                }

                timeout(sender, warningTime.Spam, timeoutTime.Spam, silentTimeout.SpamMessage, tags);
                sendMessage(sender, spamMessage, silentTimeout.Spam);
                return;
            }

            // Long msg filter
            if (longMessageToggle && messageLength >= longMessageLimit) {
                if (!regulars.LongMsg && $.isReg(sender) || !subscribers.LongMsg && $.isSubv3(sender, event.getTags())) {
                    return;
                }

                timeout(sender, warningTime.LongMsg, timeoutTime.LongMsg, silentTimeout.LongMessage, tags);
                sendMessage(sender, longMessageMessage, silentTimeout.LongMsg);
                return;
            }

            // Fake purge filter
            if (fakePurgeToggle && $.patternDetector.getFakePurge(event)) {
                if (!regulars.FakePurge && $.isReg(sender) || !subscribers.FakePurge && $.isSubv3(sender, event.getTags())) {
                    return;
                }

                timeout(sender, warningTime.FakePurge, timeoutTime.FakePurge, silentTimeout.FakePurgeMessage, tags);
                sendMessage(sender, fakePurgeMessage, silentTimeout.FakePurge);
                return;
            }

            // Emotes folter
            if (emotesToggle && $.patternDetector.getEmotesCount(event) >= emotesLimit) {
                if (!regulars.Emotes && $.isReg(sender) || !subscribers.Emotes && $.isSubv3(sender, event.getTags())) {
                    return;
                }

                timeout(sender, warningTime.Emotes, timeoutTime.Emotes, silentTimeout.EmoteMessage, tags);
                sendMessage(sender, emotesMessage, silentTimeout.Emotes);
                return;
            }

            // Caps filter
            if (capsToggle && messageLength >= capsTriggerLength) {
                if ((($.patternDetector.getNumberOfCaps(event) / messageLength) * 100) >= capsLimitPercent) {
                    if (!regulars.Caps && $.isReg(sender) || !subscribers.Caps && $.isSubv3(sender, event.getTags())) {
                        return;
                    }

                    timeout(sender, warningTime.Caps, timeoutTime.Caps, silentTimeout.CapMessage, tags);
                    sendMessage(sender, capsMessage, silentTimeout.Caps);
                    return;
                }
            }

            // Color filter
            if (colorsToggle && $.patternDetector.getColoredMessage(event)) {
                if (!regulars.Colors && $.isReg(sender) || !subscribers.Colors && $.isSubv3(sender, event.getTags())) {
                    return;
                }

                timeout(sender, warningTime.Colors, timeoutTime.Colors, silentTimeout.ColorMessage, tags);
                sendMessage(sender, colorsMessage, silentTimeout.Colors);
                return;
            }

            // Spam tracker
            if (spamTrackerToggle) {
                if (!regulars.SpamTracker && $.isReg(sender) || !subscribers.SpamTracker && $.isSubv3(sender, event.getTags())) {
                    return;
                }

                if (spamTracker[sender] !== undefined) {
                    if (spamTracker[sender].time - $.systemTime() <= 0) {
                        spamTracker[sender] = {count: 0, time: ($.systemTime() + (spamTrackerTime * 1e3))};
                    }
                    spamTracker[sender].count++;
                } else {
                    spamTracker[sender] = {count: 1, time: ($.systemTime() + (spamTrackerTime * 1e3))};
                }
                if (spamTracker[sender].count >= spamTrackerLimit) {
                    timeout(sender, warningTime.SpamTracker, timeoutTime.SpamTracker, silentTimeout.SpamTrackerMessage, tags);
                    sendMessage(sender, spamTrackerMessage, silentTimeout.SpamTracker);
                    delete spamTracker[sender];
                }
            }
        }
    }

    /**
     * @function extraCommands
     * Handles the commands that the normal function can't.
     */
    function extraCommands(event) {
        var sender = event.getSender(),
            command = event.getCommand(),
            argString = event.getArguments(),
            args = event.getArgs(),
            action = args[0],
            subAction = args[1];

        if (command.equalsIgnoreCase('moderation') || command.equalsIgnoreCase('mod')) { // js can't handle anymore commands in the default function.
            if (!action) {
                return;
            }

            /**
             * @commandpath moderation togglemoderationlogs - Toggles the moderation logs. You will need to reboot if you are enabling it.
             */
            if (action.equalsIgnoreCase('togglemoderationlogs')) {
                moderationLogs = !moderationLogs;
                $.inidb.set('chatModerator', 'moderationLogs', moderationLogs);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.moderation.logs', (moderationLogs === true ? $.lang.get('chatmoderator.moderation.enabled') : $.lang.get('common.disabled'))));
            }

            /**
             * @commandpath moderation spamtracker [on / off] - Enable/Disable the spam tracker. This limits how many messages a user can sent in 30 seconds by default
             */
            if (action.equalsIgnoreCase('spamtracker')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.spamtracker.usage', getModerationFilterStatus(spamTrackerToggle, true)));
                    return;
                }

                if (subAction.equalsIgnoreCase('on') || subAction.equalsIgnoreCase('off')) {
                    spamTrackerToggle = subAction.equalsIgnoreCase('on');
                    $.inidb.set('chatModerator', 'spamTrackerToggle', spamTrackerToggle);
                    $.say($.whisperPrefix(sender) + (spamTrackerToggle ? $.lang.get('chatmoderator.spamtracker.filter.enabled') : $.lang.get('chatmoderator.spamtracker.filter.disabled')));
                    $.log.event('Spam-überprüfungsfilter wurde umgestellt: ' + subAction + ' von ' + sender);
                    return;
                }
            }

            /**
             * @commandpath moderation spamtrackerlimit [amount of messages] - Sets how many messages a user can sent in 30 seconds by default
             */
            if (action.equalsIgnoreCase('spamtrackerlimit')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.spamtracker.limit.usage'));
                    return;
                }
                spamTrackerLimit = parseInt(subAction);
                $.inidb.set('chatModerator', 'spamTrackerLimit', spamTrackerLimit);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.spamtracker.limit.set', spamTrackerLimit));
                $.log.event(sender + ' änderte das Limit für den Spam Tracker auf ' + spamTrackerLimit);
                return;
            }

            /**
             * @commandpath moderation spamtrackertime [amount in seconds] - Sets how many messages a user can sent in 30 seconds by default
             */
            if (action.equalsIgnoreCase('spamtrackertime')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.spamtracker.time.usage'));
                    return;
                }

                spamTrackerTime = parseInt(subAction);
                $.inidb.set('chatModerator', 'spamTrackerTime', spamTrackerTime);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.spamtracker.time.set', spamTrackerTime));
                $.log.event(sender + ' hat die Spam-Tracker-Zeit auf ' + spamTrackerTime + 'geändert');
                return;
            }

            /**
             * @commandpath moderation spamtrackermessage [message] - Sets the spam tracker warning message
             */
            if (action.equalsIgnoreCase('spamtrackermessage')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.spamtracker.message.usage'));
                    return;
                }
                spamTrackerMessage = argString.replace(action, '').trim();
                $.inidb.set('chatModerator', 'spamTrackerMessage', spamTrackerMessage);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.spamtracker.message.set', spamTrackerMessage));
                $.log.event(sender + ' änderte die Spam-Tracker-Warnmeldung in "' + spamTrackerMessage + '"');
                return;
            }

            if (action.equalsIgnoreCase('regulars')) {
                if (subAction && subAction.equalsIgnoreCase('spamtracker')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.regulars.toggle.spamtracker', getModerationFilterStatus(regulars.SpamTracker)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        regulars.SpamTracker = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'regularsModerateSpamTracker', regulars.SpamTracker);
                        $.say($.whisperPrefix(sender) + (regulars.SpamTracker ? $.lang.get('chatmoderator.regulars.spamtracker.allowed') : $.lang.get('chatmoderator.regulars.spamtracker.not.allowed')));
                        $.log.event(sender + ' änderte die Moderation der Stammgäste für Spam-Tracker auf ' + args[2] + ' gestellt');
                        return;
                    }
                }
            }

            if (action.equalsIgnoreCase('subscribers')) {
                if (subAction && subAction.equalsIgnoreCase('spamtracker')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.subscribers.toggle.spamtracker', getModerationFilterStatus(subscribers.SpamTracker)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        subscribers.SpamTracker = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'subscribersModerateSpamTracker', subscribers.SpamTracker);
                        $.say($.whisperPrefix(sender) + (subscribers.SpamTracker ? $.lang.get('chatmoderator.subscribers.spamtracker.allowed') : $.lang.get('chatmoderator.subscribers.spamtracker.not.allowed')));
                        $.log.event(sender + ' hat die Abonnenten Moderation für Spam Tracker auf ' + args[2] + ' gestellt');
                        return;
                    }
                }
            }

            if (action.equalsIgnoreCase('silenttimeout')) {
                if (subAction && subAction.equalsIgnoreCase('spamtracker')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.silenttimeout.toggle.spamtracker', getModerationFilterStatus(silentTimeout.SpamTracker, true)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        silentTimeout.SpamTracker = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'silentTimeoutSpamTracker', silentTimeout.SpamTracker);
                        $.say($.whisperPrefix(sender) + (silentTimeout.SpamTracker ? $.lang.get('chatmoderator.silenttimeout.spamtracker.true') : $.lang.get('chatmoderator.silenttimeout.spamtracker.false')));
                        $.log.event(sender + ' hat die stille Bestarfungsmoderation für den Spam-Tracker auf ' + args[2] + ' gestellt');
                        return;
                    }
                }
            }

            if (action.equalsIgnoreCase('warningtime')) {
                if (subAction && subAction.equalsIgnoreCase('spamtracker')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.warningtime.spamtracker.usage', warningTime.SpamTracker));
                        return;
                    }

                    warningTime.SpamTracker = parseInt(args[2]);
                    $.inidb.set('chatModerator', 'warningTimeSpamTracker', warningTime.SpamTracker);
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.warningtime.spamtracker', warningTime.SpamTracker));
                    $.log.event(sender + ' hat die Verwarnzeit für den Spam-Tracker geändert auf: ' + warningTime.SpamTracker);
                }
            }

            if (action.equalsIgnoreCase('timeouttime')) {
                if (subAction && subAction.equalsIgnoreCase('spamtracker')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.timeouttime.spamtracker.usage', timeoutTime.SpamTracker));
                        return;
                    }

                    timeoutTime.SpamTracker = parseInt(args[2]);
                    $.inidb.set('chatModerator', 'timeoutTimeSpamTracker', timeoutTime.SpamTracker);
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.timeouttime.spamtracker', timeoutTime.SpamTracker));
                    $.log.event(sender + ' hat die Timeout Zeit für den Spam-Tracker geändert auf: ' + timeoutTime.SpamTracker);
                }
            }

            /**
             * @commandpath moderation fakepurge [on / off] - Enable/Disable the fake purges filter. This will remove <message deleted> variations if enabled.
             */
            if (action.equalsIgnoreCase('fakepurge')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.fakepurge.usage', getModerationFilterStatus(fakePurgeToggle, true)));
                    return;
                }

                if (subAction.equalsIgnoreCase('on') || subAction.equalsIgnoreCase('off')) {
                    fakePurgeToggle = subAction.equalsIgnoreCase('on');
                    $.inidb.set('chatModerator', 'fakePurgeToggle', fakePurgeToggle);
                    $.say($.whisperPrefix(sender) + (fakePurgeToggle ? $.lang.get('chatmoderator.fakepurge.filter.enabled') : $.lang.get('chatmoderator.fakepurge.filter.disabled')));
                    $.log.event('Fake Purge Filter wurde umgestellt: ' + subAction + ' von ' + sender);
                    return;
                }
            }

            /**
             * @commandpath moderation fakepurgemessage [message] - Sets the fake purge warning message
             */
            if (action.equalsIgnoreCase('fakepurgemessage')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.fakepurge.message.usage'));
                    return;
                }
                fakePurgeMessage = argString.replace(action, '').trim();
                $.inidb.set('chatModerator', 'fakePurgeMessage', fakePurgeMessage);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.fakepurge.message.set', fakePurgeMessage));
                $.log.event(sender + ' änderte die Fake Purge Verwarnnachricht in "' + fakePurgeMessage + '"');
                return;
            }

            if (action.equalsIgnoreCase('regulars')) {
                if (subAction && subAction.equalsIgnoreCase('fakepurge')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.regulars.toggle.fakepurge', getModerationFilterStatus(regulars.FakePurge)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        regulars.FakePurge = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'regularsModerateFakePurge', regulars.FakePurge);
                        $.say($.whisperPrefix(sender) + (regulars.FakePurge ? $.lang.get('chatmoderator.regulars.fakepurge.allowed') : $.lang.get('chatmoderator.regulars.fakepurge.not.allowed')));
                        $.log.event(sender + ' änderte Stammgäste Moderation für Fake Purge zu ' + args[2]);
                        return;
                    }
                }
            }

            if (action.equalsIgnoreCase('subscribers')) {
                if (subAction && subAction.equalsIgnoreCase('fakepurge')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.subscribers.toggle.fakepurge', getModerationFilterStatus(subscribers.FakePurge)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        subscribers.FakePurge = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'subscribersModerateFakePurge', subscribers.FakePurge);
                        $.say($.whisperPrefix(sender) + (subscribers.FakePurge ? $.lang.get('chatmoderator.subscribers.fakepurge.allowed') : $.lang.get('chatmoderator.subscribers.fakepurge.not.allowed')));
                        $.log.event(sender + ' änderte Abonnenten Moderation für Fake Purge zu ' + args[2]);
                        return;
                    }
                }
            }

            if (action.equalsIgnoreCase('silenttimeout')) {
                if (subAction && subAction.equalsIgnoreCase('fakepurge')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.silenttimeout.toggle.fakepurge', getModerationFilterStatus(silentTimeout.FakePurge, true)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        silentTimeout.FakePurge = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'silentTimeoutFakePurge', silentTimeout.FakePurge);
                        $.say($.whisperPrefix(sender) + (silentTimeout.FakePurge ? $.lang.get('chatmoderator.silenttimeout.fakepurge.true') : $.lang.get('chatmoderator.silenttimeout.fakepurge.false')));
                        $.log.event(sender + ' änderte die Stille Timeout-Moderation für Fake Purge zu ' + args[2]);
                        return;
                    }
                }
            }

            if (action.equalsIgnoreCase('warningtime')) {
                if (subAction && subAction.equalsIgnoreCase('fakepurge')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.warningtime.fakepurge.usage', warningTime.FakePurge));
                        return;
                    }

                    warningTime.FakePurge = parseInt(args[2]);
                    $.inidb.set('chatModerator', 'warningTimeFakePurge', warningTime.FakePurge);
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.warningtime.fakepurge', warningTime.FakePurge));
                    $.log.event(sender + ' hat die Verwarnzeit für Fake Purgeg geändert auf: ' + warningTime.FakePurge);
                }
            }

            if (action.equalsIgnoreCase('timeouttime')) {
                if (subAction && subAction.equalsIgnoreCase('fakepurge')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.timeouttime.fakepurge.usage', timeoutTime.FakePurge));
                        return;
                    }

                    timeoutTime.FakePurge = parseInt(args[2]);
                    $.inidb.set('chatModerator', 'timeoutTimeFakePurge', timeoutTime.FakePurge);
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.timeouttime.fakepurge', timeoutTime.FakePurge));
                    $.log.event(sender + ' hat die Timeout Zeit für Fake Purge geändert auf: ' + timeoutTime.FakePurge);
                }
            }
        }

        /**
         * @commandpath blacklist - Show usage of command to manipulate the blacklist of words in chat
         */
        if (command.equalsIgnoreCase('blacklist')) {
            if (!action) {
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.blacklist.usage'));
                return;
            }

            /**
             * @commandpath blacklist add [timeout time (-1 = ban)] [word] - Adds a word to the blacklist. Use regex: at the start to specify a regex blacklist.
             */
            if (action.equalsIgnoreCase('add')) {
                if (!subAction || !args[2] || isNaN(parseInt(subAction))) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.blacklist.add.usage'));
                    return;
                }
                var word = argString.split(' ').slice(2).join(' '),
                    isRegex = word.startsWith('regex:'),
                    timeout = parseInt(subAction),
                    obj = {};

                obj = {
                    id: String(($.inidb.GetKeyList('blackList', '').length + 1)),
                    timeout: String(timeout),
                    isRegex: isRegex,
                    phrase: String(word),
                    isSilent: false,
                    excludeRegulars: false,
                    excludeSubscribers: false,
                    message: timeout !== -1 ? String(blacklistMessage) : String(blacklistMessageBan),
                    banReason: String(silentTimeout.BlacklistMessage)
                };

                $.inidb.set('blackList', word, JSON.stringify(obj));
                loadBlackList();
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.blacklist.added'));
                $.log.event('"' + word + '" wurde von ' + sender + ' zur Sperrliste hinzugefügt');
            }

            /**
             * @commandpath blacklist remove [word] - Removes a word from the blacklist.
             */
            if (action.equalsIgnoreCase('remove')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.blacklist.remove.usage'));
                    return;
                } else if (!$.inidb.exists('blackList', argString.split(' ').slice(1).join(' '))) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.err'));
                    return;
                }
                $.inidb.del('blackList', argString.split(' ').slice(1).join(' '));
                loadBlackList();
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.blacklist.removed'));
            }
        }

        /**
         * @commandpath whitelist - Shows usage of command to manipulate the whitelist links
         */
        if (command.equalsIgnoreCase('whitelist')) {
            if (!action) {
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.whitelist.usage'));
                return;
            }

            /**
             * @commandpath whitelist add [link] - Adds a link to the whitelist
             */
            if (action.equalsIgnoreCase('add')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.whitelist.add.usage'));
                    return;
                }
                var link = argString.split(' ').slice(1).join(' ').toLowerCase() + '';
                $.inidb.set('whiteList', link, 'true');
                whiteList.push(link);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.whitelist.link.added'));
                $.log.event('"' + link + '" wurde von ' + sender + ' zur Ausnahmeliste hinzugefügt');
            }

            /**
             * @commandpath whitelist remove [link] - Removes a link from the whitelist.
             */
            if (action.equalsIgnoreCase('remove')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.whitelist.remove.usage'));
                    return;
                } else if (!$.inidb.exists('whiteList', argString.split(' ').slice(1).join(' ').toLowerCase())) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.err'));
                    return;
                }
                $.inidb.del('whiteList', argString.split(' ').slice(1).join(' ').toLowerCase());
                loadWhiteList();
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.whitelist.removed'));
            }
        }

        /**
         * @commandpath permit [user] - Permit someone to post a link for a configured period of time
         */
        if (command.equalsIgnoreCase('permit')) {
            if (!linksToggle) {
                return;
            }

            if (!action) {
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.permit.usage'));
                return;
            }

            action = $.user.sanitize(action);

            // if the user got a warning/timeout, unban him, and remove him from the warning/timeout list.
            if (timeouts[action] !== undefined) {
                $.session.sayNow('.unban ' + action);
                delete timeouts[action];
            }

            permitUser(action);
            $.say(action + $.lang.get('chatmoderator.permited', linkPermitTime));
            $.log.event(action + ' wurde von ' + sender + ' erlaubt');
            return;
        }
    }

    /**
     * @event ircClearchat
     */
    /* Removed this for now because sometimes it fails and  it fails to send the moderation timeout and message because of it.
    $.bind('ircClearchat', function(event) {
        $.log.event(event.getUser() + ' has been timed out for ' + String(event.getDuration()) + ' seconds. Reason: ' + event.getReason());
    });
    */

    /**
     * @event command
     */
    $.bind('command', function(event) {
        var sender = event.getSender(),
            command = event.getCommand(),
            argString = event.getArguments(),
            args = event.getArgs(),
            action = args[0],
            subAction = args[1];

        /**
         * Handle extra commands
         */
        extraCommands(event);

        /**
         * @commandpath moderation - Shows usage for the various chat moderation options
         */
        if (command.equalsIgnoreCase('moderation') || command.equalsIgnoreCase('mod')) {
            if (!action) {
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.usage.toggles'));
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.usage.messages'));
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.options'));
                return;
            }

            /**
             * @commandpath moderation links [on / off] - Enable/Disable the link filter
             */
            if (action.equalsIgnoreCase('links')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.link.usage', getModerationFilterStatus(linksToggle, true)));
                    return;
                }

                if (subAction.equalsIgnoreCase('on') || subAction.equalsIgnoreCase('off')) {
                    linksToggle = subAction.equalsIgnoreCase('on');
                    $.inidb.set('chatModerator', 'linksToggle', linksToggle);
                    $.say($.whisperPrefix(sender) + (linksToggle ? $.lang.get('chatmoderator.link.filter.enabled') : $.lang.get('chatmoderator.link.filter.disabled')));
                    $.log.event('Link-Filter wurde von ' + sender + ' ' + subAction);
                    return;
                }
            }

            /**
             * @commandpath moderation caps [on / off] - Enable/Disable the caps filter
             */
            if (action.equalsIgnoreCase('caps')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.caps.usage', getModerationFilterStatus(capsToggle, true)));
                    return;
                }

                if (subAction.equalsIgnoreCase('on') || subAction.equalsIgnoreCase('off')) {
                    capsToggle = subAction.equalsIgnoreCase('on');
                    $.inidb.set('chatModerator', 'capsToggle', capsToggle);
                    $.say($.whisperPrefix(sender) + (capsToggle ? $.lang.get('chatmoderator.caps.filter.enabled') : $.lang.get('chatmoderator.caps.filter.disabled')));
                    $.log.event('Caps-Filter wurde von ' + sender + ' ' + subAction);
                    return;
                }
            }

            /**
             * @commandpath moderation spam [on / off] - Enable/Disable the spam filter
             */
            if (action.equalsIgnoreCase('spam')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.spam.usage', getModerationFilterStatus(spamToggle, true)));
                    return;
                }

                if (subAction.equalsIgnoreCase('on') || subAction.equalsIgnoreCase('off')) {
                    spamToggle = subAction.equalsIgnoreCase('on');
                    $.inidb.set('chatModerator', 'spamToggle', spamToggle);
                    $.say($.whisperPrefix(sender) + (spamToggle ? $.lang.get('chatmoderator.spam.filter.enabled') : $.lang.get('chatmoderator.spam.filter.disabled')));
                    $.log.event('Spam-Filter wurde von ' + sender + ' ' + subAction);
                    return;
                }
            }

            /**
             * @commandpath moderation symbols [on / off] - Enable/Disable the symbol filter
             */
            if (action.equalsIgnoreCase('symbols')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.symbols.usage', getModerationFilterStatus(symbolsToggle, true)));
                    return;
                }

                if (subAction.equalsIgnoreCase('on') || subAction.equalsIgnoreCase('off')) {
                    symbolsToggle = subAction.equalsIgnoreCase('on');
                    $.inidb.set('chatModerator', 'symbolsToggle', symbolsToggle);
                    $.say($.whisperPrefix(sender) + (symbolsToggle ? $.lang.get('chatmoderator.symbols.filter.enabled') : $.lang.get('chatmoderator.symbols.filter.disabled')));
                    $.log.event('Symbole-Filter wurde von ' + sender + ' ' + subAction);
                    return;
                }
            }

            /**
             * @commandpath moderation emotes [on / off] - Enable/Disable the emotes filter
             */
            if (action.equalsIgnoreCase('emotes')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.emotes.usage', getModerationFilterStatus(emotesToggle, true)));
                    return;
                }

                if (subAction.equalsIgnoreCase('on') || subAction.equalsIgnoreCase('off')) {
                    emotesToggle = subAction.equalsIgnoreCase('on');
                    $.inidb.set('chatModerator', 'emotesToggle', emotesToggle);
                    $.say($.whisperPrefix(sender) + (emotesToggle ? $.lang.get('chatmoderator.emotes.filter.enabled') : $.lang.get('chatmoderator.emotes.filter.disabled')));
                    $.log.event('Emotes Filter wurde von ' + sender + ' ' + subAction);
                    return;
                }
            }

            /**
             * @commandpath moderation colors [on / off] - Enable/Disable the message color filter
             */
            if (action.equalsIgnoreCase('colors')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.colors.usage', getModerationFilterStatus(colorsToggle, true)));
                    return;
                }

                if (subAction.equalsIgnoreCase('on') || subAction.equalsIgnoreCase('off')) {
                    colorsToggle = subAction.equalsIgnoreCase('on');
                    $.inidb.set('chatModerator', 'colorsToggle', colorsToggle);
                    $.say($.whisperPrefix(sender) + (colorsToggle ? $.lang.get('chatmoderator.colors.filter.enabled') : $.lang.get('chatmoderator.colors.filter.disabled')));
                    $.log.event('Farbfilter wurde von '+ sender + ' ' + subAction);
                    return;
                }
            }

            /**
             * @commandpath moderation longmessages [on / off] - Enable/Disable the longmessages filter
             */
            if (action.equalsIgnoreCase('longmessages')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.message.usage', getModerationFilterStatus(longMessageToggle, true)));
                    return;
                }

                if (subAction.equalsIgnoreCase('on') || subAction.equalsIgnoreCase('off')) {
                    longMessageToggle = subAction.equalsIgnoreCase('on');
                    $.inidb.set('chatModerator', 'longMessageToggle', longMessageToggle);
                    $.say($.whisperPrefix(sender) + (longMessageToggle ? $.lang.get('chatmoderator.message.filter.enabled') : $.lang.get('chatmoderator.message.filter.disabled')));
                    $.log.event('Der Filter für lange Nachrichten wurde von ' + sender + ' ' + subAction);
                    return;
                }
            }

            /**
             * @commandpath moderation regulars [links / caps / symbols / spam / emotes / colors / longmessages / spamtracker / fakepurge] [true / false] - Enable or disable if regulars get moderated by that filter
             */
            if (action.equalsIgnoreCase('regulars')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.regulars.usage'));
                    return;
                }

                if (subAction.equalsIgnoreCase('links')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.regulars.toggle.link', getModerationFilterStatus(regulars.Links)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        regulars.Links = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'regularsModerateLinks', regulars.Links);
                        $.say($.whisperPrefix(sender) + (regulars.Links ? $.lang.get('chatmoderator.regulars.links.allowed') : $.lang.get('chatmoderator.regulars.links.not.allowed')));
                        $.log.event(sender + ' änderte Stammgäste Moderation für Links zu ' + args[2]);
                        return;
                    }
                } else if (subAction.equalsIgnoreCase('caps')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.regulars.toggle.caps', getModerationFilterStatus(regulars.Caps)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        regulars.Caps = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'regularsModerateCaps', regulars.Caps);
                        $.say($.whisperPrefix(sender) + (regulars.Caps ? $.lang.get('chatmoderator.regulars.caps.allowed') : $.lang.get('chatmoderator.regulars.caps.not.allowed')));
                        $.log.event(sender + ' änderte Stammgäste Moderation für Caps zu ' + args[2]);
                        return;
                    }
                } else if (subAction.equalsIgnoreCase('symbols')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.regulars.toggle.symbols', getModerationFilterStatus(regulars.Symbols)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        regulars.Symbols = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'regularsModerateSymbols', regulars.Symbols);
                        $.say($.whisperPrefix(sender) + (regulars.Symbols ? $.lang.get('chatmoderator.regulars.symbols.allowed') : $.lang.get('chatmoderator.regulars.symbols.not.allowed')));
                        $.log.event(sender + ' änderte Stammgäste Moderation für Symbole zu ' + args[2]);
                        return;
                    }
                } else if (subAction.equalsIgnoreCase('spam')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.regulars.toggle.spam', getModerationFilterStatus(regulars.Spam)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        regulars.Spam = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'regularsModerateSpam', regulars.Spam);
                        $.say($.whisperPrefix(sender) + (regulars.Spam ? $.lang.get('chatmoderator.regulars.spam.allowed') : $.lang.get('chatmoderator.regulars.spam.not.allowed')));
                        $.log.event(sender + ' änderte die Moderation der Stammgäste für Spam zu ' + args[2]);
                        return;
                    }
                } else if (subAction.equalsIgnoreCase('emotes')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.regulars.toggle.emotes', getModerationFilterStatus(regulars.Emotes)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        regulars.Emotes = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'regularsModerateEmotes', regulars.Emotes);
                        $.say($.whisperPrefix(sender) + (regulars.Emotes ? $.lang.get('chatmoderator.regulars.emotes.allowed') : $.lang.get('chatmoderator.regulars.emotes.not.allowed')));
                        $.log.event(sender + ' änderte Stammgäste Moderation für Emotes zu ' + args[2]);
                        return;
                    }
                } else if (subAction.equalsIgnoreCase('colors')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.regulars.toggle.colors', getModerationFilterStatus(regulars.Colors)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        regulars.Colors = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'regularsModerateColors', regulars.Colors);
                        $.say($.whisperPrefix(sender) + (regulars.Colors ? $.lang.get('chatmoderator.regulars.colors.allowed') : $.lang.get('chatmoderator.regulars.colors.not.allowed')));
                        $.log.event(sender + ' ändert Stammgäste Moderation für Farben zu ' + args[2]);
                        return;
                    }
                } else if (subAction.equalsIgnoreCase('longmessages')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.regulars.toggle.long.msg', getModerationFilterStatus(regulars.LongMsg)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        regulars.LongMsg = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'regularsModerateColors', regulars.LongMsg);
                        $.say($.whisperPrefix(sender) + (regulars.LongMsg ? $.lang.get('chatmoderator.regulars.long.messages.allowed') : $.lang.get('chatmoderator.regulars.long.messages.not.allowed')));
                        $.log.event(sender + ' änderte Stammgäste Moderation für lange Nachrichten zu ' + args[2]);
                        return;
                    }
                }
            }

            /**
             * @commandpath moderation subscribers [links / caps / symbols / spam / emotes / colors / longmessages / spamtracker / fakepurge] [true / false] - Enable or disable if subscribers get moderated by that filter
             */
            if (action.equalsIgnoreCase('subscribers')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.subscribers.usage'));
                    return;
                }

                if (subAction.equalsIgnoreCase('links')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.subscribers.toggle.link', getModerationFilterStatus(subscribers.Links)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        subscribers.Links = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'subscribersModerateLinks', subscribers.Links);
                        $.say($.whisperPrefix(sender) + (subscribers.Links ? $.lang.get('chatmoderator.subscribers.links.allowed') : $.lang.get('chatmoderator.subscribers.links.not.allowed')));
                        $.log.event(sender + ' änderte Abonnenten Moderation für Links zu ' + args[2]);
                        return;
                    }
                } else if (subAction.equalsIgnoreCase('caps')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.subscribers.toggle.caps', getModerationFilterStatus(subscribers.Caps)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        subscribers.Caps = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'subscribersModerateCaps', subscribers.Caps);
                        $.say($.whisperPrefix(sender) + (subscribers.Caps ? $.lang.get('chatmoderator.subscribers.caps.allowed') : $.lang.get('chatmoderator.subscribers.caps.not.allowed')));
                        $.log.event(sender + ' änderte Abonnenten Moderation für Caps zu ' + args[2]);
                        return;
                    }
                } else if (subAction.equalsIgnoreCase('symbols')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.subscribers.toggle.symbols', getModerationFilterStatus(subscribers.Symbols)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        subscribers.Symbols = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'subscribersModerateSymbols', subscribers.Symbols);
                        $.say($.whisperPrefix(sender) + (subscribers.Symbols ? $.lang.get('chatmoderator.subscribers.symbols.allowed') : $.lang.get('chatmoderator.subscribers.symbols.not.allowed')));
                        $.log.event(sender + ' änderte Abonnenten Moderation für Symbole zu ' + args[2]);
                        return;
                    }
                } else if (subAction.equalsIgnoreCase('spam')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.subscribers.toggle.spam', getModerationFilterStatus(subscribers.Spam)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        subscribers.Spam = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'subscribersModerateSpam', subscribers.Spam);
                        $.say($.whisperPrefix(sender) + (subscribers.Spam ? $.lang.get('chatmoderator.subscribers.spam.allowed') : $.lang.get('chatmoderator.subscribers.spam.not.allowed')));
                        $.log.event(sender + ' änderte Abonnenten Moderation für Spam zu ' + args[2]);
                        return;
                    }
                } else if (subAction.equalsIgnoreCase('emotes')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.subscribers.toggle.emotes', getModerationFilterStatus(subscribers.Emotes)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        subscribers.Emotes = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'subscribersModerateEmotes', subscribers.Emotes);
                        $.say($.whisperPrefix(sender) + (subscribers.Emotes ? $.lang.get('chatmoderator.subscribers.emotes.allowed') : $.lang.get('chatmoderator.subscribers.emotes.not.allowed')));
                        $.log.event(sender + ' änderte Abonnenten Moderation für Emotes zu ' + args[2]);
                        return;
                    }
                } else if (subAction.equalsIgnoreCase('colors')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.subscribers.toggle.colors', getModerationFilterStatus(subscribers.Colors)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        subscribers.Colors = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'subscribersModerateColors', subscribers.Colors);
                        $.say($.whisperPrefix(sender) + (subscribers.Colors ? $.lang.get('chatmoderator.subscribers.colors.allowed') : $.lang.get('chatmoderator.subscribers.colors.not.allowed')));
                        $.log.event(sender + ' änderte Abonnenten Moderation für Farben zu ' + args[2]);
                        return;
                    }
                } else if (subAction.equalsIgnoreCase('longmessages')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.subscribers.toggle.long.msg', getModerationFilterStatus(subscribers.LongMsg)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        subscribers.LongMsg = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'subscribersModerateColors', subscribers.LongMsg);
                        $.say($.whisperPrefix(sender) + (subscribers.LongMsg ? $.lang.get('chatmoderator.subscribers.long.messages.allowed') : $.lang.get('chatmoderator.subscribers.long.messages.not.allowed')));
                        $.log.event(sender + ' änderte Abonnenten Moderation für lange Nachrichten zu ' + args[2]);
                        return;
                    }
                }
            }

            /**
             * @commandpath moderation silenttimeout [links / caps / symbols / spam / emotes / colors / longmessages / spamtracker / fakepurge / all] [true / false] - Enable or disable if the warning and timeout message will be said for that filter
             */
            if (action.equalsIgnoreCase('silenttimeout')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.silenttimeout.usage'));
                    return;
                }

                if (subAction.equalsIgnoreCase('links')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.silenttimeout.toggle.link', getModerationFilterStatus(silentTimeout.Links, true)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        silentTimeout.Links = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'silentTimeoutLinks', silentTimeout.Links);
                        $.say($.whisperPrefix(sender) + (silentTimeout.Links ? $.lang.get('chatmoderator.silenttimeout.links.true') : $.lang.get('chatmoderator.silenttimeout.links.false')));
                        $.log.event(sender + ' änderte die Stille Timeout-Moderation für Links zu ' + args[2]);
                        return;
                    }
                } else if (subAction.equalsIgnoreCase('caps')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.silenttimeout.toggle.caps', getModerationFilterStatus(silentTimeout.Caps, true)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        silentTimeout.Caps = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'silentTimeoutCaps', silentTimeout.Caps);
                        $.say($.whisperPrefix(sender) + (silentTimeout.Caps ? $.lang.get('chatmoderator.silenttimeout.caps.true') : $.lang.get('chatmoderator.silenttimeout.caps.false')));
                        $.log.event(sender + ' änderte die Stille Timeout-Moderation für Caps zu ' + args[2]);
                        return;
                    }
                } else if (subAction.equalsIgnoreCase('symbols')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.silenttimeout.toggle.symbols', getModerationFilterStatus(silentTimeout.Symbols, true)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        silentTimeout.Symbols = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'silentTimeoutSymbols', silentTimeout.Symbols);
                        $.say($.whisperPrefix(sender) + (silentTimeout.Symbols ? $.lang.get('chatmoderator.silenttimeout.symbols.true') : $.lang.get('chatmoderator.silenttimeout.symbols.false')));
                        $.log.event(sender + ' änderte die Stille Timeout-Moderation für Symbole zu ' + args[2]);
                        return;
                    }
                } else if (subAction.equalsIgnoreCase('spam')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.silenttimeout.toggle.spam', getModerationFilterStatus(silentTimeout.Spam, true)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        silentTimeout.Spam = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'silentTimeoutSpam', silentTimeout.Spam);
                        $.say($.whisperPrefix(sender) + (silentTimeout.Spam ? $.lang.get('chatmoderator.silenttimeout.spam.true') : $.lang.get('chatmoderator.silenttimeout.spam.false')));
                        $.log.event(sender + ' änderte die Stille Timeout-Moderation für Spam zu ' + args[2]);
                        return;
                    }
                } else if (subAction.equalsIgnoreCase('emotes')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.silenttimeout.toggle.emotes', getModerationFilterStatus(silentTimeout.Emotes, true)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        silentTimeout.Emotes = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'silentTimeoutEmotes', silentTimeout.Emotes);
                        $.say($.whisperPrefix(sender) + (silentTimeout.Emotes ? $.lang.get('chatmoderator.silenttimeout.emotes.true') : $.lang.get('chatmoderator.silenttimeout.emotes.false')));
                        $.log.event(sender + ' änderte die Stille Timeout-Moderation für Emotes zu ' + args[2]);
                        return;
                    }
                } else if (subAction.equalsIgnoreCase('colors')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.silenttimeout.toggle.colors', getModerationFilterStatus(silentTimeout.Colors, true)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        silentTimeout.Colors = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'silentTimeoutColors', silentTimeout.Colors);
                        $.say($.whisperPrefix(sender) + (silentTimeout.Colors ? $.lang.get('chatmoderator.silenttimeout.colors.true') : $.lang.get('chatmoderator.silenttimeout.colors.false')));
                        $.log.event(sender + ' änderte Stille Timeout-Moderation für Farben zu ' + args[2]);
                        return;
                    }
                } else if (subAction.equalsIgnoreCase('longmessages')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.silenttimeout.toggle.long.msg', getModerationFilterStatus(silentTimeout.LongMsg, true)));
                        return;
                    }

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        silentTimeout.LongMsg = args[2].equalsIgnoreCase('true');
                        $.inidb.set('chatModerator', 'silentTimeoutColors', silentTimeout.LongMsg);
                        $.say($.whisperPrefix(sender) + (silentTimeout.LongMsg ? $.lang.get('chatmoderator.silenttimeout.long.messages.true') : $.lang.get('chatmoderator.silenttimeout.long.messages.false')));
                        $.log.event(sender + ' änderte die Stille Timeout-Moderation für lange Nachrichten zu ' + args[2]);
                        return;
                    }
                } else if (subAction.equalsIgnoreCase('all')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.silenttimeout.usage.all'));
                        return;
                    }

                    var toggle = args[2].equalsIgnoreCase('true');

                    if (args[2].equalsIgnoreCase('true') || args[2].equalsIgnoreCase('false')) {
                        silentTimeout.Links = toggle;
                        silentTimeout.Caps = toggle;
                        silentTimeout.Symbols = toggle;
                        silentTimeout.Spam = toggle;
                        silentTimeout.Colors = toggle;
                        silentTimeout.LongMsg = toggle;
                        silentTimeout.Emotes = toggle;
                        silentTimeout.SpamTracker = toggle;
                        $.inidb.set('chatModerator', 'silentTimeoutLinks', silentTimeout.Links);
                        $.inidb.set('chatModerator', 'silentTimeoutCaps', silentTimeout.Caps);
                        $.inidb.set('chatModerator', 'silentTimeoutSymbols', silentTimeout.Symbols);
                        $.inidb.set('chatModerator', 'silentTimeoutSpam', silentTimeout.Spam);
                        $.inidb.set('chatModerator', 'silentTimeoutEmotes', silentTimeout.Emotes);
                        $.inidb.set('chatModerator', 'silentTimeoutLongMsg', silentTimeout.LongMsg);
                        $.inidb.set('chatModerator', 'silentTimeoutColors', silentTimeout.Colors);
                        $.inidb.set('chatModerator', 'silentTimeoutSpamTacker', silentTimeout.SpamTracker);
                        $.inidb.set('chatModerator', 'silentTimeoutFakePurge', silentTimeout.FakePurge);
                        $.say($.whisperPrefix(sender) + (toggle ? $.lang.get('chatmoderator.silenttimeout.true') : $.lang.get('chatmoderator.silenttimeout.false')));
                    }
                }
            }

            /**
             * @commandpath moderation warningtime [links / caps / symbols / spam / emotes / colors / longmessages / spamtracker / fakepurge] [time in seconds] - Sets a warning time for a filter. This is when the user gets timed out for the first time
             */
            if (action.equalsIgnoreCase('warningtime')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.warningtime.usage'));
                    return;
                }

                if (subAction.equalsIgnoreCase('links')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.warningtime.links.usage', warningTime.Links));
                        return;
                    }
                    warningTime.Links = parseInt(args[2]);
                    $.inidb.set('chatModerator', 'warningTimeLinks', warningTime.Links);
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.warningtime.links', warningTime.Links));
                    $.log.event(sender + ' änderte die Verwarnzeit für Links zu: ' + warningTime.Links);
                } else if (subAction.equalsIgnoreCase('caps')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.warningtime.caps.usage', warningTime.Caps));
                        return;
                    }
                    warningTime.Caps = parseInt(args[2]);
                    $.inidb.set('chatModerator', 'warningTimeCaps', warningTime.Caps);
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.warningtime.caps', warningTime.Caps));
                    $.log.event(sender + ' änderte die Verwarnzeit für Caps zu: ' + warningTime.Caps);
                } else if (subAction.equalsIgnoreCase('symbols')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.warningtime.symbols.usage', warningTime.Symbols));
                        return;
                    }
                    warningTime.Symbols = parseInt(args[2]);
                    $.inidb.set('chatModerator', 'warningTimeSymbols', warningTime.Symbols);
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.warningtime.symbols', warningTime.Symbols));
                    $.log.event(sender + ' änderte die Verwarnzeit für Symbole zu: ' + warningTime.Symbols);
                } else if (subAction.equalsIgnoreCase('spam')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.warningtime.spam.usage', warningTime.Spam));
                        return;
                    }
                    warningTime.Spam = parseInt(args[2]);
                    $.inidb.set('chatModerator', 'warningTimeSpam', warningTime.Spam);
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.warningtime.spam', warningTime.Spam));
                    $.log.event(sender + ' änderte die Verwarnzeit für Spam zu: ' + warningTime.Spam);
                } else if (subAction.equalsIgnoreCase('emotes')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.warningtime.emotes.usage', warningTime.Emotes));
                        return;
                    }
                    warningTime.Emotes = parseInt(args[2]);
                    $.inidb.set('chatModerator', 'warningTimeEmotes', warningTime.Emotes);
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.warningtime.emotes', warningTime.Emotes));
                    $.log.event(sender + ' änderte die Verwarnzeit für Emotes zu: ' + warningTime.Emotes);
                } else if (subAction.equalsIgnoreCase('colors')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.warningtime.colors.usage', warningTime.Colors));
                        return;
                    }
                    warningTime.Colors = parseInt(args[2]);
                    $.inidb.set('chatModerator', 'warningTimeColors', warningTime.Colors);
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.warningtime.colors', warningTime.Colors));
                    $.log.event(sender + ' änderte die Verwarnzeit für farbiges Schreiben zu: ' + warningTime.Colors);
                } else if (subAction.equalsIgnoreCase('longmessages')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.warningtime.longmsg.usage', warningTime.LongMsg));
                        return;
                    }
                    warningTime.LongMsg = parseInt(args[2]);
                    $.inidb.set('chatModerator', 'warningTimeLongMsg', warningTime.LongMsg);
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.warningtime.longmsg', warningTime.LongMsg));
                    $.log.event(sender + ' änderte die Verwarnzeit für lange Nachrichten zu: ' + warningTime.LongMsg);
                }
            }

            /**
             * @commandpath moderation timeouttime [links / caps / symbols / spam / emotes / colors / longmessages / spamtracker / fakepurge] [time in seconds] - Sets a timeout time for a filter. This is when a user gets timed out the for the second time
             */
            if (action.equalsIgnoreCase('timeouttime')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.timeouttime.usage'));
                    return;
                }

                if (subAction.equalsIgnoreCase('links')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.timeouttime.links.usage', timeoutTime.Links));
                        return;
                    }
                    timeoutTime.Links = parseInt(args[2]);
                    $.inidb.set('chatModerator', 'timeoutTimeLinks', timeoutTime.Links);
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.timeouttime.links', timeoutTime.Links));
                    $.log.event(sender + ' hat die Timeout-Zeit für Links geändert zu: ' + timeoutTime.Links);
                } else if (subAction.equalsIgnoreCase('caps')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.timeouttime.caps.usage', timeoutTime.Caps));
                        return;
                    }
                    timeoutTime.Caps = parseInt(args[2]);
                    $.inidb.set('chatModerator', 'timeoutTimeCaps', timeoutTime.Caps);
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.timeouttime.caps', timeoutTime.Caps));
                    $.log.event(sender + ' hat die Timeout-Zeit für Caps geändert zu: ' + timeoutTime.Caps);
                } else if (subAction.equalsIgnoreCase('symbols')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.timeouttime.symbols.usage', timeoutTime.Symbols));
                        return;
                    }
                    timeoutTime.Symbols = parseInt(args[2]);
                    $.inidb.set('chatModerator', 'timeoutTimeSymbols', timeoutTime.Symbols);
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.timeouttime.symbols', timeoutTime.Symbols));
                    $.log.event(sender + ' hat die Timeout-Zeit für Symbole geändert zu: ' + timeoutTime.Symbols);
                } else if (subAction.equalsIgnoreCase('spam')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.timeouttime.spam.usage', timeoutTime.Spam));
                        return;
                    }
                    timeoutTime.Spam = parseInt(args[2]);
                    $.inidb.set('chatModerator', 'timeoutTimeSpam', timeoutTime.Spam);
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.timeouttime.spam', timeoutTime.Spam));
                    $.log.event(sender + ' hat die Timeout-Zeit für Spam geändert zu: ' + timeoutTime.Spam);
                } else if (subAction.equalsIgnoreCase('emotes')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.timeouttime.emotes.usage', timeoutTime.Emotes));
                        return;
                    }
                    timeoutTime.Emotes = parseInt(args[2]);
                    $.inidb.set('chatModerator', 'timeoutTimeEmotes', timeoutTime.Emotes);
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.timeouttime.emotes', timeoutTime.Emotes));
                    $.log.event(sender + ' hat die Timeout-Zeit für Emotes geändert zu: ' + timeoutTime.Emotes);
                } else if (subAction.equalsIgnoreCase('colors')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.timeouttime.colors.usage', timeoutTime.Colors));
                        return;
                    }
                    timeoutTime.Colors = parseInt(args[2]);
                    $.inidb.set('chatModerator', 'timeoutTimeColors', timeoutTime.Colors);
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.timeouttime.colors', timeoutTime.Colors));
                    $.log.event(sender + ' hat die Timeout-Zeit für farbiges Schreiben geändert zu: ' + timeoutTime.Colors);
                } else if (subAction.equalsIgnoreCase('longmessages')) {
                    if (!args[2]) {
                        $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.timeouttime.longmsg.usage', timeoutTime.LongMsg));
                        return;
                    }
                    timeoutTime.LongMsg = parseInt(args[2]);
                    $.inidb.set('chatModerator', 'timeoutTimeLongMsg', timeoutTime.LongMsg);
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.timeouttime.longmsg', timeoutTime.LongMsg));
                    $.log.event(sender + ' hat die Timeout-Zeit für lange Nachrichten geändert zu: ' + timeoutTime.LongMsg);
                }
            }

            /**
             * @commandpath moderation linksmessage [message] - Sets the link warning message
             */
            if (action.equalsIgnoreCase('linksmessage')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.link.message.usage'));
                    return;
                }
                linksMessage = argString.replace(action, '').trim();
                $.inidb.set('chatModerator', 'linksMessage', linksMessage);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.link.message.set', linksMessage));
                $.log.event(sender + ' änderte die Links-Warnmeldung auf "' + linksMessage + '"');
                return;
            }

            /**
             * @commandpath moderation capsmessage [message] - Sets the cap warning message
             */
            if (action.equalsIgnoreCase('capsmessage')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.caps.message.usage'));
                    return;
                }
                capsMessage = argString.replace(action, '').trim();
                $.inidb.set('chatModerator', 'capsMessage', capsMessage);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.caps.message.set', capsMessage));
                $.log.event(sender + ' änderte die Caps-Warnmeldung auf "' + capsMessage + '"');
                return;
            }

            /**
             * @commandpath moderation symbolsmessage [message] - Sets the symbols warning message
             */
            if (action.equalsIgnoreCase('symbolsmessage')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.symbols.message.usage'));
                    return;
                }
                symbolsMessage = argString.replace(action, '').trim();
                $.inidb.set('chatModerator', 'symbolsMessage', symbolsMessage);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.symbols.message.set', symbolsMessage));
                $.log.event(sender + ' änderte die Symbol-Warnmeldung auf "' + symbolsMessage + '"');
                return;
            }

            /**
             * @commandpath moderation emotesmessage [message] - Sets the emotes warning message
             */
            if (action.equalsIgnoreCase('emotesmessage')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.emotes.message.usage'));
                    return;
                }
                emotesMessage = argString.replace(action, '').trim();
                $.inidb.set('chatModerator', 'emotesMessage', emotesMessage);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.emotes.message.set', emotesMessage));
                $.log.event(sender + ' änderte die Emote-Warnmeldung auf "' + emotesMessage + '"');
                return;
            }

            /**
             * @commandpath moderation colorsmessage [message] - Sets the color warning message
             */
            if (action.equalsIgnoreCase('colorsmessage')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.colors.message.usage'));
                    return;
                }
                colorsMessage = argString.replace(action, '').trim();
                $.inidb.set('chatModerator', 'colorsMessage', colorsMessage);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.colors.message.set', colorsMessage));
                $.log.event(sender + ' änderte die Warnmeldung für farbiges Schreiben auf "' + colorsMessage + '"');
                return;
            }

            /**
             * @commandpath moderation longmsgmessage [message] - Sets the long message warning message
             */
            if (action.equalsIgnoreCase('longmsgmessage')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.message.message.usage'));
                    return;
                }
                longMessageMessage = argString.replace(action, '').trim();
                $.inidb.set('chatModerator', 'longMessageMessage', longMessageMessage);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.message.message.set', longMessageMessage));
                $.log.event(sender + ' änderte die Warnmeldung für lange Nachrichten auf "' + longMessageMessage + '"');
                return;
            }

            /**
             * @commandpath moderation spammessage [message] - Sets the spam warning message
             */
            if (action.equalsIgnoreCase('spammessage')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.spam.message.usage'));
                    return;
                }
                spamMessage = argString.replace(action, '').trim();
                $.inidb.set('chatModerator', 'spamMessage', spamMessage);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.spam.message.set', spamMessage));
                $.log.event(sender + ' änderte die Spam-Warnmeldung in "' + spamMessage + '"');
                return;
            }

            /**
             * @commandpath moderation blacklistmessage [message] - Sets the blacklist warning message that will be default for blacklists you add from chat. This can be custom on the panel.
             */
            if (action.equalsIgnoreCase('blacklistmessage')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.blacklist.message.usage'));
                    return;
                }
                blacklistMessage = argString.replace(action, '').trim();
                $.inidb.set('chatModerator', 'blacklistMessage', blacklistMessage);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.blacklist.message.set', blacklistMessage));
                $.log.event(sender + ' änderte die Warnmeldung für die Verbotsliste in "' + blacklistMessage + '"');
                return;
            }

            /**
             * @commandpath moderation blacklistmessageban [message] - Sets the blacklist ban message that will be default for blacklists you add from chat. This can be custom on the panel.
             */
            if (action.equalsIgnoreCase('blacklistmessageban')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.blacklistban.message.usage'));
                    return;
                }
                blacklistMessageBan = argString.replace(action, '').trim();
                $.inidb.set('chatModerator', 'blacklistMessageBan', blacklistMessageBan);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.blacklistban.message.set', blacklistMessageBan));
                $.log.event(sender + ' Bann Nachricht für verbotene Worte umgestellt: "' + blacklistMessageBan + '"');
                return;
            }

            /**
             * @commandpath moderation permittime [seconds] - Sets the permit time in seconds
             */
            if (action.equalsIgnoreCase('permittime')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.permit.time.usage'));
                    return;
                }
                linkPermitTime = parseInt(subAction);
                $.inidb.set('chatModerator', 'linkPermitTime', linkPermitTime);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.permit.time.set', linkPermitTime));
                $.log.event(sender + ' Länge der Link Erlaubnis umgestellt: ' + linkPermitTime + ' Sekunden');
                return;
            }

            /**
             * @commandpath moderation capslimit [amount] - Sets the amount (in percent) of caps allowed in a message
             */
            if (action.equalsIgnoreCase('capslimit')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.caps.limit.usage'));
                    return;
                }
                capsLimitPercent = parseFloat(subAction);
                $.inidb.set('chatModerator', 'capsLimitPercent', capsLimitPercent);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.caps.limit.set', capsLimitPercent));
                $.log.event(sender + ' Caps Limit umgestellt: ' + capsLimitPercent);
                return;
            }

            /**
             * @commandpath moderation capstriggerlength [amount] - Sets the minimum amount of charaters before checking for caps
             */
            if (action.equalsIgnoreCase('capstriggerlength')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.caps.trigger.length.usage'));
                    return;
                }
                capsTriggerLength = parseInt(subAction);
                $.inidb.set('chatModerator', 'capsTriggerLength', capsTriggerLength);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.caps.trigger.length.set', capsTriggerLength));
                $.log.event(sender + ' Ab wann nach Caps gesucht wird umgestellt: ' + capsTriggerLength);
                return;
            }

            /**
             * @commandpath moderation spamlimit [amount] - Sets the amount of repeating charaters allowed in a message
             */
            if (action.equalsIgnoreCase('spamlimit')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.spam.limit.usage'));
                    return;
                }
                spamLimit = parseInt(subAction);
                $.inidb.set('chatModerator', 'spamLimit', spamLimit);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.spam.limit.set', spamLimit));
                $.log.event(sender + ' Spam Limit umgestellt: ' + spamLimit);
                return;
            }

            /**
             * @commandpath moderation symbolslimit [amount] - Sets the amount (in percent) of symbols allowed in a message
             */
            if (action.equalsIgnoreCase('symbolslimit')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.symbols.limit.usage'));
                    return;
                }
                symbolsLimitPercent = parseFloat(subAction);
                $.inidb.set('chatModerator', 'symbolsLimitPercent', symbolsLimitPercent);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.symbols.limit.set', symbolsLimitPercent));
                $.log.event(sender + ' Symbol Limit umgestellt: ' + symbolsLimitPercent);
                return;
            }

            /**
             * @commandpath moderation symbolsgrouplimit [amount] - Sets the max amount of grouped symbols allowed in a message
             */
            if (action.equalsIgnoreCase('symbolsgrouplimit')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.symbols.group.limit.usage'));
                    return;
                }
                symbolsGroupLimit = parseInt(subAction);
                $.inidb.set('chatModerator', 'symbolsGroupLimit', symbolsGroupLimit);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.symbols.group.limit.set', symbolsGroupLimit));
                $.log.event(sender + ' Menge der erlaubten gruppierten Symbole umgestellt: ' + symbolsGroupLimit);
                return;
            }

            /**
             * @commandpath moderation symbolstriggerlength [amount] - Sets the minimum amount of charaters before checking for symbols
             */
            if (action.equalsIgnoreCase('symbolsTriggerLength')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.symbols.trigger.length.usage'));
                    return;
                }

                symbolsTriggerLength = parseInt(subAction);
                $.inidb.set('chatModerator', 'symbolsTriggerLength', symbolsTriggerLength);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.symbols.trigger.length.set', symbolsTriggerLength));
                $.log.event(sender + ' Menge der erlaubten Symbole umgestellt: ' + symbolsTriggerLength);
                return;
            }

            /**
             * @commandpath moderation emoteslimit [amount] - Sets the amount of emotes allowed in a message
             */
            if (action.equalsIgnoreCase('emoteslimit')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.emotes.limit.usage'));
                    return;
                }
                emotesLimit = parseInt(subAction);
                $.inidb.set('chatModerator', 'emotesLimit', emotesLimit);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.emotes.limit.set', emotesLimit));
                return;
            }

            /**
             * @commandpath moderation messagecharacterlimit [amount] - Sets the amount of characters allowed in a message
             */
            if (action.equalsIgnoreCase('messagecharacterlimit')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.message.limit.usage'));
                    return;
                }
                longMessageLimit = parseInt(subAction);
                $.inidb.set('chatModerator', 'longMessageLimit', longMessageLimit);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.message.limit.set', longMessageLimit));
                return;
            }

            /**
             * @commandpath moderation messagecooldown [seconds] - Sets a cooldown in seconds on the timeout messages (minimum is 30 seconds)
             */
            if (action.equalsIgnoreCase('messagecooldown')) {
                if (!subAction || parseInt(subAction) < 30) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.msgcooldown.usage'));
                    return;
                }
                msgCooldownSec = parseInt(subAction);
                $.inidb.set('chatModerator', 'msgCooldownSecs', msgCooldownSec);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.msgcooldown.set', msgCooldownSec));
            }

            /**
             * @commandpath moderation warningresettime [seconds] - Sets how long a user stays on his first offence for (there are 2 offences). Default is 60 minutes (minimum is 30 minutes)
             */
            if (action.equalsIgnoreCase('warningresettime')) {
                if (!subAction) {
                    $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.warningresettime.usage'));
                    return;
                }
                warningResetTime = parseInt(subAction);
                $.inidb.set('chatModerator', 'warningResetTime', warningResetTime);
                $.say($.whisperPrefix(sender) + $.lang.get('chatmoderator.warningresettime.set', warningResetTime));
            }
        }
    });

    /**
     * @event initReady
     */
    $.bind('initReady', function() {
        loadWhiteList();
        loadBlackList();

        $.registerChatCommand('./core/chatModerator.js', 'permit', 2);
        $.registerChatCommand('./core/chatModerator.js', 'moderation', 1);
        $.registerChatCommand('./core/chatModerator.js', 'mod', 1);
        $.registerChatCommand('./core/chatModerator.js', 'blacklist', 1);
        $.registerChatCommand('./core/chatModerator.js', 'whitelist', 1);
    });

    /** Export functions to API */
    $.performModeration = performModeration;
    $.timeoutUser = timeoutUserFor;
    $.permitUserLink = permitUser;
    $.reloadModeration = reloadModeration;
})();
