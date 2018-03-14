package com.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.DAO.MathTestDAO;
import com.entity.MathTest;
@Service
public class MathTestService {
	@Autowired
	MathTestDAO mathtestdao;
	public int add(MathTest mathtest) {
		return mathtestdao.add(mathtest);
		
	}
	public List<MathTest> findMathTestList(){
		
		return mathtestdao.findMathTestList();
		
	}
}
