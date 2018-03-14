package com.entity;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

@Table(name="MathTest")  
@Entity  
public class MathTest {
	private int id;
	private String name;
	private double score;
	private String date;
	@GeneratedValue  
	@Id  
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public String getDate() {
		return date;
	}
	public void setDate(String date) {
		this.date = date;
	}
	public double getScore() {
		return score;
	}
	public void setScore(double d) {
		this.score = d;
	}

}
