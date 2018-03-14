package com.DAO;

import java.util.List;

import com.entity.User;

public interface UserDAO {
    int add(User user);
    User findUserById(int id);
    User findUserByUsernameAndPassword(String username,String password);
    List<User> findUserList();

}
