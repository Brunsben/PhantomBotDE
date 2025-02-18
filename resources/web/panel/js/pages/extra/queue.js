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

// Function that querys all of the data we need.
$(run = function() {
    // Check if the module is enabled.
    socket.getDBValues('queue_module', {
        tables: ['modules', 'queueSettings'],
        keys: ['./systems/queueSystem.js', 'isActive']
    }, true, function(e) {
        // If the module is off, don't load any data.
        if (!helpers.handleModuleLoadUp(['queueModule', 'queueListModule'], e['./systems/queueSystem.js'], 'queueModuleToggle')) {
            // Remove the chat.
            $('#queue-chat').find('iframe').remove();
            return;
        } else {
            if (location.protocol.toLowerCase().startsWith('https') && !(location.port > 0 && location.port !== 443)) {
            // Add Twitch chat.
            $('#queue-chat').html($('<iframe/>', {
                'frameborder': '0',
                'scrolling': 'no',
                'style': 'width: 100%; height: 532px;',
                    'src': 'https://www.twitch.tv/embed/' + getChannelName() + '/chat' + (helpers.isDark ? '?darkpopout&' : '?') + 'parent=' + location.hostname
            }));
            } else {
                $('#queue-chat').html('Aufgrund von Änderungen durch Twitch kann das Chat-Panel nicht mehr angezeigt werden, es sei denn, du aktivierst SSL im PhantomBot-Panel und änderst den Baseport auf 443. Dies funktioniert möglicherweise nicht ohne Root-Privilegien.<br /><br />Alternativ können Sie sich mit der GitHub-Version des Panels bei <a href="https://phantombot.github.io/PhantomBot/">PhantomBot - GitHub.io</a> anmelden, die dieses Problem umgeht.<br /><br />Hilfe beim Einrichten von SSL finden Sie in <a href="https://phantombot.github.io/PhantomBot/guides/#guide=content/twitchembeds">diesem Handbuch</a>.');
                $('#queue-chat').addClass('box-body');
            }
        }

        // Update the open button to close if the queue is active.
        if (e['isActive'] === 'true') {
            $('#open-or-close-queue').html($('<i/>', {
                'class': 'fa fa-lock'
            })).append('&nbsp; Close').removeClass('btn-success').addClass('btn-warning');
        }

        // Function that updates the queue list.
        helpers.temp.updateQueueList = function() {
            // Get queue list.
            socket.getDBTableValues('get_queue_list', 'queue', function(results) {
                const table = $('#queue-table');

                const trim = function(username) {
                    if (username.length > 15) {
                        return username.substr(0, 15) + '...';
                    } else {
                        return username;
                    }
                };

                // Sort.
                results.sort(function(a, b) {
                    return parseInt(JSON.parse(a.value).position) - parseInt(JSON.parse(b.value).position);
                });

                // Remove current data content.
                table.find('tr:gt(0)').remove();

                for (let i = 0; i < results.length; i++) {
                    const json = JSON.parse(results[i].value),
                        tr = $('<tr/>');

                    // Add position.
                    tr.append($('<td/>', {
                        'html': json.position
                    }));

                    // Add name.
                    tr.append($('<td/>', {
                        'html': trim(json.username),
                        'data-toggle': 'tooltip',
                        'title': json.username
                    }));

                    // Add gamer tag.
                    tr.append($('<td/>', {
                        'html': (json.tag.length === 0 ? 'None' : trim(json.tag)),
                        'data-toggle': 'tooltip',
                        'title': (json.tag.length === 0 ? 'None' : json.tag)
                    }));

                    // Add the del button.
                    tr.append($('<td/>', {
                        'html': $('<button/>', {
                            'type': 'button',
                            'class': 'btn btn-xs btn-danger',
                            'style': 'float: right',
                            'html': $('<i/>', {
                                'class': 'fa fa-trash'
                            }),
                            'click': function() {
                                socket.wsEvent('rm_queue_user', './systems/queueSystem.js', null,
                                    ['remove', results[i].key], helpers.temp.updateQueueList);
                            }
                        })
                    }));

                    // Add to the table.
                    table.append(tr);
                }
            });
        };

        helpers.temp.updateQueueList();
    });
});

// Function that handlers the loading of events.
$(function() {
    const QUEUE_SCRIPT = './systems/queueSystem.js';
    let canUpdate = true;

    /*
     * @function Clears the input boxes of the queue.
     */
    const clearQueueInput = function() {
        $('#queue-title').val('');
        $('#queue-cost, #queue-size').val('0');
        $('#queue-permission').val('Viewers');
    };

    // Toggle for the module.
    $('#queueModuleToggle').on('change', function() {
        // Enable the module then query the data.
        socket.sendCommandSync('queue_module_toggle_cmd',
            'module ' + ($(this).is(':checked') ? 'enablesilent' : 'disablesilent') + ' ./systems/queueSystem.js', run);
    });

    // Queue open/close button.
    $('#open-or-close-queue').on('click', function() {
        if ($(this)[0].innerText.trim() === 'Öffnen') {
            let title = $('#queue-title'),
                cost = $('#queue-cost'),
                size = $('#queue-size'),
                permission = $('#queue-permission').find(':selected').text();

            switch (false) {
                case helpers.handleInputString(title):
                case helpers.handleInputNumber(cost, 0):
                case helpers.handleInputNumber(size, 0):
                    break;
                default:
                    socket.sendCommand('queue_permisison_update', 'permcomsilent joinqueue ' + helpers.getGroupIdByName(permission, true), function() {
                        socket.updateDBValue('queue_command_cost', 'pricecom', 'joinqueue', cost.val(), function() {
                            socket.wsEvent('queue_open_ws', QUEUE_SCRIPT, null, ['open', size.val(), title.val()], function() {
                                toastr.success('Warteschlange erfolgreich eröffnet!');
                                // Update the button.
                                $('#open-or-close-queue').html($('<i/>', {
                                    'class': 'fa fa-lock'
                                })).append('&nbsp; Close').removeClass('btn-success').addClass('btn-warning');
                            });
                        });
                    });
            }
        } else {
            socket.wsEvent('close_queue_ws', QUEUE_SCRIPT, null, ['close'], function() {
                toastr.success('Warteschlange erfolgreich geschlossen!');
                clearQueueInput();
                // Update the button.
                $('#open-or-close-queue').html($('<i/>', {
                    'class': 'fa fa-unlock-alt'
                })).append('&nbsp; Öffnen').removeClass('btn-warning').addClass('btn-success');
            });
        }
    });

    // Clear queue command.
    $('#reset-queue').on('click', function() {
        socket.wsEvent('clear_queue_ws', QUEUE_SCRIPT, null, ['clear'], function() {
            toastr.success('Warteschlange erfolgreich geleert!');
            clearQueueInput();
            helpers.temp.updateQueueList();
        });
    });

    // Draw users command.
    $('#draw-queue').on('click', function() {
        helpers.getModal('queue-draw-users', 'Benutzer ziehen', 'Ziehen', $('<form/>', {
            'role': 'form'
        })
        // Append amount to draw
        .append(helpers.getInputGroup('draw-amount', 'number', 'Anzahl der zu wählenden Benutzer', '', '1', 'Die Anzahl der Benutzer, die aus der Warteschlange gezogen werden sollen.')),
        // Callback.
        function() {
            let amount = $('#draw-amount');

            switch (false) {
                case helpers.handleInputNumber(amount, 1, 5):
                    break;
                default:
                    socket.wsEvent('draw_queue_users', QUEUE_SCRIPT, null, ['pick', amount.val()], function() {
                        // Alert the user.
                        toastr.success(amount.val() + ' Benutzer aus der Warteschlange gezogen!');
                        // Update the list.
                        helpers.temp.updateQueueList();
                        // Close the modal.
                        $('#queue-draw-users').modal('toggle');
                    });
            }
        }).modal('toggle');
    });

    // Handle mouse over on queue list.
    $('#queueTable').on('mouseenter mouseleave', function(event) {
        canUpdate = event.type === 'mouseleave';
    });

    // Update every 5 seconds.
    helpers.setInterval(function() {
        if (canUpdate) {
            helpers.temp.updateQueueList();
        }
    }, 5e3);
});
