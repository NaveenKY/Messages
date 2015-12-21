package com.message.bean;

import java.util.HashMap;

public class MessageBean {
	private String type;
	private HashMap<String, String> data;
	public String getType() {
		return type;
	}
	public void setType(String type) {
		this.type = type;
	}
	public HashMap<String, String> getData() {
		return data;
	}
	public void setData(HashMap<String, String> data) {
		this.data = data;
	}
}
