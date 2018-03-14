package com.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.DAO.UserDAO;
import com.entity.User;
@Service
public class UserService {
	@Autowired
	UserDAO userdao;
	public int add(User user) {
		return userdao.add(user);
	}

	public User findUserById(int id) {
		return userdao.findUserById(id);
	}

	public List<User> findUserList() {
		return userdao.findUserList();
	}

	public User findUserByUsernameAndPassword(String username, String password) {
		return userdao.findUserByUsernameAndPassword(username, password);
	}
    
}
