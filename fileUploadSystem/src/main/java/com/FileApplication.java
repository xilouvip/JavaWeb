package com;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.RestController;
@SpringBootApplication   //标注启动类  
@RestController     //标注controller  
public class FileApplication {
	public static void main(String[] args) {
         SpringApplication.run(FileApplication.class, args);    
         System.out.println("file upload system");
         System.out.println("");

     }

}
