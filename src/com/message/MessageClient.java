package com.message;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.util.HashMap;
import java.util.Iterator;
import java.util.concurrent.ConcurrentHashMap;

import javax.servlet.http.HttpServletRequest;

import org.apache.catalina.websocket.MessageInbound;
import org.apache.catalina.websocket.StreamInbound;
import org.apache.catalina.websocket.WsOutbound;

import com.google.gson.Gson;
import com.message.bean.MessageBean;

@SuppressWarnings("deprecation")
public class MessageClient extends MessageInbound {

	private String name;

	private WsOutbound client;

	private String sessionId;
	private String userId;

	public MessageClient(HttpServletRequest httpServletRequest, String userId) {
		this.sessionId = httpServletRequest.getSession().getId();
		this.userId = userId;
		this.name = userId;
	}

	@Override
	public void onOpen(WsOutbound client) {
		this.client = client;
		try {
			this.sendUserList();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

	@Override
	public void onClose(int status) {
		if(MessageServlet.clients.get(this.userId) != null) {
			if(MessageServlet.clients.get(this.userId).size() > 1) {
				MessageServlet.clients.get(this.userId).remove(this.sessionId);
			} else {
				MessageServlet.clients.remove(this.userId);
			}
		}
		try {
			this.sendUserList();
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		System.out.println("Close client");
		// remove from list
	}

	@Override
	protected void onBinaryMessage(ByteBuffer arg0) throws IOException {

	}

	@Override
	protected void onTextMessage(CharBuffer inChar) throws IOException {

		System.out.println("Accept msg");
		String outbuf = CharBuffer.wrap("- " + this.userId + " says : \n").toString();
		String buf = CharBuffer.wrap(inChar).toString();
		MessageBean bean = new Gson().fromJson(buf, MessageBean.class);
		
		if(bean.getType().equalsIgnoreCase(MessageConstants.TYPE_NEW_MESSAGE)) {
			//FIX-ME
			//Store message in DB, if status is success push message to the user, else return error to the sender 
			bean.getData().put("message", outbuf + bean.getData().get("message"));
			ConcurrentHashMap<String, StreamInbound> userSessions = MessageServlet.clients.get(bean.getData().get("to"));
			Iterator<String> sessionItr = userSessions.keySet().iterator();
			while (sessionItr.hasNext()) {
				String sessionId = sessionItr.next();
				MessageClient client = (MessageClient) userSessions.get(sessionId);
				client.client.writeTextMessage(CharBuffer.wrap(new Gson().toJson(bean)));
				client.client.flush();
			}
		}
	}

	protected void sendUserList() throws IOException {
		MessageBean userList = new MessageBean();
		userList.setType(MessageConstants.TYPE_USER_LIST);
		HashMap<String, String> users = new HashMap<String, String>();
		Iterator<String> itr = MessageServlet.clients.keySet().iterator();
		while (itr.hasNext()) {
			String userId = itr.next();
			ConcurrentHashMap<String, StreamInbound> userSessions = MessageServlet.clients.get(userId);
			Iterator<String> sessionItr = userSessions.keySet().iterator();
			while (sessionItr.hasNext()) {
				String sessionId = sessionItr.next();
				MessageClient client = (MessageClient) userSessions.get(sessionId);
				users.put(client.userId, client.name);
			}
		}
		userList.setData(users);
		String result = new Gson().toJson(userList);
		itr = MessageServlet.clients.keySet().iterator();
		while (itr.hasNext()) {
			String userId = itr.next();
			ConcurrentHashMap<String, StreamInbound> userSessions = MessageServlet.clients.get(userId);
			Iterator<String> sessionItr = userSessions.keySet().iterator();
			while (sessionItr.hasNext()) {
				String sessionId = sessionItr.next();
				MessageClient client = (MessageClient) userSessions.get(sessionId);
				client.client.writeTextMessage(CharBuffer.wrap(result));
				client.client.flush();
			}
		}
	}
}
