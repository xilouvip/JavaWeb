package com.DAO;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.PreparedStatementSetter;
import org.springframework.stereotype.Repository;

import com.entity.MathTest;
import com.entity.User;

@Repository
public class MathTestImpl implements MathTestDAO {
	@Autowired
	private JdbcTemplate jdbcTemplate;
	SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");

	@Override
	public int add(final MathTest mathTest) {
		int result = jdbcTemplate.update("insert into MathTest (name,score,date) VALUES (?,?,?)",
				new PreparedStatementSetter() {
					public void setValues(PreparedStatement ps) throws SQLException {
						ps.setString(1, mathTest.getName());
						ps.setDouble(2, mathTest.getScore());
						try {
							ps.setDate(3, new java.sql.Date(sdf.parse(mathTest.getDate()).getTime()));
						} catch (ParseException e) {
					
							e.printStackTrace();
						}
					}
				});

		return result;
	}

	@Override
	public List<MathTest> findMathTestList() {
		@SuppressWarnings({ "unchecked", "rawtypes" })
		List<MathTest> list = jdbcTemplate.query("select * from MathTest", new Object[] {},
				new BeanPropertyRowMapper(User.class));
		if (list != null && list.size() > 0) {
			return list;
		} else {
			return null;
		}
	}

}
