package com.service;

import java.io.FileInputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFDateUtil;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public class XlsxReader {
	protected Logger logger = Logger.getLogger(XlsxReader.class.getName());

	protected Map<String, List<List<String>>> all = new HashMap<String, List<List<String>>>();

	protected int headerRow = 0;// -1 for no header row
	protected int dataRow = headerRow + 1;
	protected int startColumn = 0; // 1 for export from sql
									// developer(第一列是序号等非数据信息）

	protected Map<String, Object> EXCLUDE_SHEETS = new HashMap<String, Object>();

	public XlsxReader() {
		EXCLUDE_SHEETS.put("SQL", "equal");
		EXCLUDE_SHEETS.put("#", "startWith");
	}

	@SuppressWarnings("unlikely-arg-type")
	public Map<String, List<List<String>>> read(String filePath) throws IOException {
		XSSFWorkbook wb = null;
		try {
			wb = new XSSFWorkbook(new FileInputStream(filePath));
			int sheetCount = wb.getNumberOfSheets();
			for (int i = 0; i < sheetCount; i++) {
				XSSFSheet sheet = wb.getSheetAt(i);
				String sheetName = sheet.getSheetName();
				if (!EXCLUDE_SHEETS.containsKey(sheetName.charAt(0)) && !EXCLUDE_SHEETS.containsKey(sheetName)) {
					List<List<String>> data = readExcelSheet(sheet);
					all.put(sheet.getSheetName(), data);
					logger.info("read sheet " + sheetName + " , rows = " + (data.size() - 1));
				} else {
					logger.fine("ignore sheet " + sheetName);
				}
			}
		} catch (IOException e) {
			logger.log(Level.SEVERE, "read file error. file = " + filePath, e);
		} finally {
			if (wb != null) {
				wb.close();
			}
		}

		logger.info("read file end. file = " + filePath);

		return all;
	}

	/**
	 * 读取Excel数据内容
	 * 
	 * @param InputStream
	 * @return Map 包含单元格数据内容的Map对象
	 */
	public List<List<String>> readExcelSheet(XSSFSheet sheet) {
		List<List<String>> data = new ArrayList<List<String>>();

		// 读取数据标题
		List<String> rowData = new ArrayList<String>();
		if (headerRow >= 0) {
			XSSFRow row = sheet.getRow(headerRow);
			int colNum = row.getPhysicalNumberOfCells();
			colNum = row.getLastCellNum();
			for (int i = 0; i < colNum; i++) {
				// title[i] = getStringCellValue(row.getCell((short) i));
				rowData.add(getCellValue(row.getCell((short) i)));
			}
			data.add(rowData);
		}

		// 取得数据内容
		int rowNum = sheet.getLastRowNum();
		int colNum = rowData.size();
		// 正文内容应该从第二行开始,第一行为表头的标题
		for (int i = dataRow; i <= rowNum; i++) {
			XSSFRow row = sheet.getRow(i);
			rowData = new ArrayList<String>();
			for (int j = 0; j < colNum; j++) {
				String value = getCellValue(row.getCell((short) j));
				rowData.add(value);
			}
			data.add(rowData);
		}

		return data;
	}

	SimpleDateFormat sdf = new SimpleDateFormat("yyyy/MM/dd");

	/**
	 * 根据HSSFCell类型设置数据
	 * 
	 * @param cell
	 * @return
	 */
	@SuppressWarnings("deprecation")
	protected String getCellValue(XSSFCell cell) {
		String cellvalue = "";
		if (cell != null) {
			switch (cell.getCellType()) {
			case HSSFCell.CELL_TYPE_STRING:
				cellvalue = cell.getRichStringCellValue().getString();
				break;
			// case HSSFCell.CELL_TYPE_NUMERIC:
			// cellvalue = String.valueOf(cell.getNumericCellValue());
			// break;
			case HSSFCell.CELL_TYPE_NUMERIC:
				if (HSSFDateUtil.isCellDateFormatted(cell)) {
					// 如果是date类型则 ，获取该cell的date值
					cellvalue = sdf.format(HSSFDateUtil.getJavaDate(cell.getNumericCellValue()));
				} else { // 纯数字
					cellvalue = String.valueOf(cell.getNumericCellValue());
				}
				break;
			case HSSFCell.CELL_TYPE_BLANK:
				cellvalue = "";
				break;
			default:
				logger.severe("发现字符串以外数据。row=" + cell.getRowIndex() + ", column = " + cell.getColumnIndex()
						+ ", sheet = " + cell.getSheet().getSheetName() + ", cell type = " + cell.getCellTypeEnum());
				cellvalue = cell.getStringCellValue();
			}
		}
		return cellvalue;

	}
}
