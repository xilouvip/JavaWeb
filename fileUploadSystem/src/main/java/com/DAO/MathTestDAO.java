package com.DAO;

import java.util.List;

import com.entity.MathTest;


public interface MathTestDAO {
	int add(MathTest mathtest);
	List<MathTest> findMathTestList();

}
