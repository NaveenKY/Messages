package com.message;

import java.io.IOException;
import java.nio.CharBuffer;
import java.util.HashMap;
import java.util.Iterator;
import java.util.concurrent.ConcurrentHashMap;

import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import com.google.gson.Gson;
import com.message.bean.MessageBean;

@ServerEndpoint("/message")
public class MessageServlet {

	public static ConcurrentHashMap<String, ConcurrentHashMap<String, Session>> clients = new ConcurrentHashMap<String, ConcurrentHashMap<String, Session>>();

	@OnOpen
	public void onOpen(Session session) {
		String userId = session.getRequestParameterMap().get("userId").get(0);
		System.out.println(userId + " has opened a connection");
		try {
			if (clients.containsKey(userId)) {
				ConcurrentHashMap<String, Session> userSessions = clients.get(userId);
				if (!userSessions.containsKey(session.getId())) {
					userSessions.put(session.getId(), session);
				}
			} else {
				ConcurrentHashMap<String, Session> userSessions = new ConcurrentHashMap<String, Session>();
				userSessions.put(session.getId(), session);
				clients.put(userId, userSessions);
			}
			session.getBasicRemote().sendText("Connection Established");
			sendUserList(session);
		} catch (IOException ex) {
			ex.printStackTrace();
		}
	}

	@OnMessage
	public void onMessage(String message, Session session) {
		System.out.println("Message from " + session.getId() + ": " + message);
		try {
			String userId = session.getRequestParameterMap().get("userId").get(0);
			String outbuf = CharBuffer.wrap("- " + userId + " says : \n").toString();
			MessageBean bean = new Gson().fromJson(message, MessageBean.class);

			if (bean.getType().equalsIgnoreCase(MessageConstants.TYPE_NEW_MESSAGE)) {
				bean.getData().put("message", outbuf + bean.getData().get("message"));
				ConcurrentHashMap<String, Session> userSessions = MessageServlet.clients.get(bean.getData().get("to"));
				Iterator<String> sessionItr = userSessions.keySet().iterator();
				while (sessionItr.hasNext()) {
					String sessionId = sessionItr.next();
					Session client = userSessions.get(sessionId);
					client.getBasicRemote().sendText(new Gson().toJson(bean));
				}
			}
		} catch (IOException ex) {
			ex.printStackTrace();
		}
	}

	@OnClose
	public void onClose(Session session) {
		System.out.println("Session " + session.getId() + " has ended");
	}

	protected void sendUserList(Session session) throws IOException {
		MessageBean userList = new MessageBean();
		userList.setType(MessageConstants.TYPE_USER_LIST);
		HashMap<String, String> users = new HashMap<String, String>();
		Iterator<String> itr = clients.keySet().iterator();
		while (itr.hasNext()) {
			String userId = itr.next();
			ConcurrentHashMap<String, Session> userSessions = MessageServlet.clients.get(userId);
			Iterator<String> sessionItr = userSessions.keySet().iterator();
			while (sessionItr.hasNext()) {
				String sessionId = sessionItr.next();
				Session client = (Session) userSessions.get(sessionId);
				String name = client.getRequestParameterMap().get("userId").get(0);
				users.put(name, name);
			}
		}
		userList.setData(users);
		String result = new Gson().toJson(userList);
		itr = MessageServlet.clients.keySet().iterator();
		while (itr.hasNext()) {
			String userId = itr.next();
			ConcurrentHashMap<String, Session> userSessions = MessageServlet.clients.get(userId);
			Iterator<String> sessionItr = userSessions.keySet().iterator();
			while (sessionItr.hasNext()) {
				String sessionId = sessionItr.next();
				Session client = (Session) userSessions.get(sessionId);
				client.getBasicRemote().sendText(result);
			}
		}
	}
}