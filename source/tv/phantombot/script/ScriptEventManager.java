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
package tv.phantombot.script;

import com.gmt2001.Reflect;
import java.util.ArrayList;
import java.util.List;
import java.util.Map.Entry;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import net.engio.mbassy.listener.Handler;
import org.apache.commons.lang3.text.WordUtils;
import tv.phantombot.event.Event;
import tv.phantombot.event.Listener;

public class ScriptEventManager implements Listener {

    private static final ScriptEventManager instance = new ScriptEventManager();
    private final ConcurrentHashMap<String, ScriptEventHandler> events = new ConcurrentHashMap<>();
    private final List<String> classes = new ArrayList<String>();
    private boolean isKilled = false;

    /**
     * Method to get this instance.
     *
     * @return {Object}
     */
    public static ScriptEventManager instance() {
        return instance;
    }

    /**
     * Class constructor.
     */
    private ScriptEventManager() {
        Thread.setDefaultUncaughtExceptionHandler(com.gmt2001.UncaughtExceptionHandler.instance());

        registerClasses();
    }

    private void registerClasses() {
        Reflect.instance().loadPackageRecursive(Event.class.getName().substring(0, Event.class.getName().lastIndexOf('.')));
        Reflect.instance().getSubTypesOf(Event.class).stream().filter((c) -> (!this.classes.contains(c.getName().substring(0, c.getName().lastIndexOf('.'))))).forEachOrdered((c) -> {
            this.classes.add(c.getName().substring(0, c.getName().lastIndexOf('.')));
            com.gmt2001.Console.debug.println("Registered event package " + c.getName().substring(0, c.getName().lastIndexOf('.')));
        });
    }

    /**
     * Method that handles events.
     *
     * @param {Event} event
     */
    @Handler
    public void onEvent(Event event) {
        if (!isKilled) {
            try {
                String eventName = event.getClass().getSimpleName();
                ScriptEventHandler e = events.get(eventName);

                e.handle(event);

                com.gmt2001.Console.debug.println("Dispatched event " + eventName);
            } catch (Exception ex) {
                com.gmt2001.Console.err.println("Dispatchen des Events fehlgeschlagen " + event.getClass().getName());
                com.gmt2001.Console.err.printStackTrace(ex);
            }
        }
    }

    /**
     * Method to see if an event exists, this is used from init.js.
     *
     * @param {String} eventName
     * @return {Boolean}
     */
    public boolean hasEvent(String eventName) {
        return events.containsKey((WordUtils.capitalize(eventName) + "Event"));
    }

    /**
     * Method to register event handlers.
     *
     * @param {String} eventName
     * @param {ScriptEventHandler} handler
     */
    public void register(String eventName, ScriptEventHandler handler) {
        register(eventName, handler, true);
    }

    private void register(String eventName, ScriptEventHandler handler, boolean recurse) {
        eventName = WordUtils.capitalize(eventName) + "Event";
        Class<? extends Event> event = null;

        for (String c : classes) {
            try {
                event = Class.forName(c + "." + eventName).asSubclass(Event.class);
                break;
            } catch (ClassNotFoundException ex) {

            }
        }

        if (event != null) {
            events.put(event.getSimpleName(), handler);
        } else if (recurse) {
            registerClasses();
            register(eventName, handler, false);
        } else {
            com.gmt2001.Console.err.println("Event Klasse nicht gefunden für: " + eventName);
        }
    }

    /**
     * Method to unregister an event handler.
     *
     * @param {ScriptEventHandler} handler
     */
    public void unregister(ScriptEventHandler handler) {
        Set<Entry<String, ScriptEventHandler>> entries = events.entrySet();

        entries.stream().filter((e) -> (e.getValue() == handler)).forEachOrdered((e) -> {
            events.remove(e.getKey());
        });
    }

    /**
     * Method to kill this instance.
     */
    public void kill() {
        this.isKilled = true;
    }
}
