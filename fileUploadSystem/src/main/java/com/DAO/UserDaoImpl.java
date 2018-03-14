package com.DAO;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementSetter;
import org.springframework.stereotype.Repository;
import com.entity.User;
@Repository
public class UserDaoImpl implements UserDAO{
    @Autowired
    private JdbcTemplate jdbcTemplate;
	@Override
	public int add(final User user) {
        int result = jdbcTemplate.update("insert into Fuser (username,password) VALUES (?,?)", new PreparedStatementSetter() {
            public void setValues(PreparedStatement ps) throws SQLException {
                ps.setString(1,user.getUsername());
                ps.setString(2,user.getPassword());
            }
        });
 
        return result;
	}

	@SuppressWarnings({ "unchecked", "rawtypes" })
	@Override
	public List<User> findUserList() {
        List<User> list = jdbcTemplate.query("select * from Fuser", new Object[]{}, new BeanPropertyRowMapper(User.class));
        if(list!=null && list.size()>0){
            return list;
        }else{
            return null;
        }
    }


	@SuppressWarnings({ "unchecked", "rawtypes" })
	@Override
	public User findUserByUsernameAndPassword(String username, String password) {
	       List<User> list = jdbcTemplate.query("select * from Fuser where username = ? and password = ?", new Object[]{username,password}, new BeanPropertyRowMapper(User.class));
	        if(list!=null && list.size()>0){
	            User user = list.get(0);
	            return user;
	        }else{
	            return null;
	        }
	}


	@SuppressWarnings({ "unchecked", "rawtypes" })
	@Override
	public User findUserById(int id) {
	       List<User> list = jdbcTemplate.query("select * from Fuser where id = ?", new Object[]{id}, new BeanPropertyRowMapper(User.class));
	        if(list!=null && list.size()>0){
	            User user = list.get(0);
	            return user;
	        }else{
	            return null;
	        }
	}

}
