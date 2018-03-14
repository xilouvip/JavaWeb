package com.controller;

import java.util.HashMap;
import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import com.entity.User;
import com.service.UserService;

@RestController
public class UserController {
	@Autowired
	UserService userservice;

	@RequestMapping("/add")
	public String addUser() {
		User user = new User();
		user.setId(6);
		user.setUsername("zcp");
		user.setPassword("123");
		int result = userservice.add(user);
		if (result > 0) {
			return "success";
		} else {
			return "error";
		}

	}

	@RequestMapping("/login")
	public String login() {
		String username = "tst1";
		String password = "123";
		User user = userservice.findUserByUsernameAndPassword(username, password);
		if (user != null) {
			return "success";
		} else {
			return "error";
		}

	}

	@RequestMapping("/templates/log")
	@ResponseBody
	public Map<String, Object> login(User user, HttpServletRequest request, HttpServletResponse response) {
		Map<String, Object> map = new HashMap<String, Object>();
		User result = userservice.findUserByUsernameAndPassword(user.getUsername(), user.getPassword());
		if (result != null) {
			map.put("status", 1);
			map.put("message", "login success");
			System.out.println("login success");
			return map;

		} else {
			map.put("status", 0);
			map.put("message", "login error");
			System.out.println("login fail");
			return map;

		}

	}

}
