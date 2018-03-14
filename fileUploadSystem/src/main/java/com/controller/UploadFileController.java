package com.controller;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.entity.MathTest;
import com.service.MathTestService;
import com.service.XlsxReader;

@RestController
@RequestMapping("/templates")
public class UploadFileController {
	@Autowired
	MathTestService mathtestservice;
	List<MathTest> mathtestlist = new ArrayList<MathTest>();

	@RequestMapping(value = "/updatedata", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> updatedata() {
		System.out.println("action updating");
		Map<String, Object> map = new HashMap<String, Object>();
		String Msg = null;
		int flag = 2;

		try {
			for (int i = 0; i < mathtestlist.size(); i++) {
				mathtestservice.add(mathtestlist.get(i));
			}
			Msg = "update success";
			flag = 1;
			System.out.println("update success");

		} catch (Exception e) {
		
			e.printStackTrace();
			flag = 0;
			Msg = "update error";
			System.out.println("update fail");
		}
		map.put("status", flag);
		map.put("message", Msg);
		mathtestlist.clear();
		return map;
	}

	@RequestMapping(value = "/fileupload", method = RequestMethod.POST)
	@ResponseBody
	public Map<String, Object> upload(@RequestParam(value = "file", required = false) MultipartFile file) {
		System.out.println("action uploading");
		Map<String, Object> map = new HashMap<String, Object>();
		String Msg = null;
		int flag = 2;
		String path = "C:\\Users\\zhou.chp\\eclipse-workspace\\fileUploadSystem\\src\\main\\webapp\\static\\file";
		String fileName = file.getOriginalFilename();

		System.out.println("filename===" + fileName);
		if (fileName.equals("")) {
			Msg = "未选择文件!";
			flag = 0;
		} else if (fileName.endsWith(".xlsx")) {
			File targetFile = new File(path + "\\" + fileName);
			if (targetFile.exists()) {
				targetFile.delete();
			} else {
				try {
					targetFile.createNewFile();
				} catch (IOException e) {
		
					e.printStackTrace();
				}
			}
			try {
				file.transferTo(targetFile);
				XlsxReader excel = new XlsxReader();
				Map<String, List<List<String>>> exceldata = null;
				exceldata = excel.read(targetFile.getAbsolutePath());
				List<List<String>> csvdata = exceldata.get("Sheet1");
				for (int rowNum = 1; rowNum < csvdata.size(); rowNum++) {
					List<String> row = csvdata.get(rowNum);
					MathTest mathtest = new MathTest();
					mathtest.setName(row.get(0));
					mathtest.setScore(Double.parseDouble(row.get(1)));
					mathtest.setDate(row.get(2));
					mathtestlist.add(mathtest);

				}
				Msg = "upload success";
				flag = 1;

			} catch (Exception e) {

				e.printStackTrace();
				flag = 0;
				Msg = "upload fail";
			}

		} else {
			Msg = "文件格式不正确!";
			flag = 0;

		}
		System.out.println(Msg);
		map.put("status", flag);
		map.put("message", Msg);
		map.put("resultdata", mathtestlist);
		return map;

	}
}
