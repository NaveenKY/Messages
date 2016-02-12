/** 
* @author Naveen Kumar <imnaveenyadav@gmail.com> 
* version: 1.0.0 
* https://github.com/NaveenKY/Messages/
*/ 
package com.message;

import java.util.concurrent.ConcurrentHashMap;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.apache.catalina.websocket.StreamInbound;
import org.apache.catalina.websocket.WebSocketServlet;

@SuppressWarnings("deprecation")
@WebServlet("/message")
public class MessageServlet extends WebSocketServlet {

	private static final long serialVersionUID = 1L;

	public static ConcurrentHashMap<String, ConcurrentHashMap<String, StreamInbound>> clients = new ConcurrentHashMap<String, ConcurrentHashMap<String, StreamInbound>>();

	@Override
	protected StreamInbound createWebSocketInbound(String protocol,
			HttpServletRequest httpServletRequest) {

		HttpSession session = httpServletRequest.getSession();
		String userId = httpServletRequest.getParameter("userId");
		StreamInbound client;
		if(clients.containsKey(userId)) {
			ConcurrentHashMap<String, StreamInbound> userSessions = clients.get(userId);
			if(userSessions.containsKey(session.getId())) {
				client = userSessions.get(session.getId());
				return client;
			} else {
				client = new MessageClient(httpServletRequest, userId);
				userSessions.put(session.getId(), client);
			}
		} else {
			client = new MessageClient(httpServletRequest, userId);
			ConcurrentHashMap<String, StreamInbound> userSessions = new ConcurrentHashMap<String, StreamInbound>();
			userSessions.put(session.getId(), client);
			clients.put(userId, userSessions);
		}
		return client;
	}
}