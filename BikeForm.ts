class BikeForm {
	sheet: Sheet;
	sheetName: string
	defaultSheetName: string

	constructor(sheetId: string, sheetName: string, defaultSheetName:string) {
		const sheet = new Sheet(sheetId, sheetName);

		this.sheet = sheet;
		this.sheetName = sheetName
		this.defaultSheetName = defaultSheetName
	}

	public generate(subject: string, description: string): string[] {
		const ss = this.sheet.spreadsheet;
		const form = FormApp.create(subject)
			.setDescription(description)
			.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());


		const name = form.addTextItem()
			.setTitle("氏名")
			.setRequired(true);

		const checkBoxValidation = FormApp.createCheckboxValidation()
			.setHelpText("一つ選んでください")
			.requireSelectExactly(1)
			.build()

		const role = form.addCheckboxItem();
		role.setRequired(true)
			.setValidation(checkBoxValidation)
			.setTitle("参加方法")
			.setChoices([
				role.createChoice("選手"),
				role.createChoice("マネージャー")
			])


		const participantStyle = form.addCheckboxItem();
		participantStyle.setTitle("バイク")
			.setChoices([
				participantStyle.createChoice("部のバイクで参加")
			])

		const car = form.addCheckboxItem();
		car.setTitle("車出し")
			.setChoices([
				car.createChoice("可能")
			])
		const remarks = form.addTextItem();
		remarks.setTitle("備考");

		const publishUrl = form.getPublishedUrl();
		const editUrl = form.getEditUrl();

		return [publishUrl, editUrl]
	}

	public renameFormSheet() {
		// flush spreadsheet to reflect generated sheet to `this.sheet` variable
		this.sheet.reload() 

		const sheets = this.sheet.sheets;
		for (const sheet of sheets){
			const isInclude = sheet.getSheetName().includes(this.defaultSheetName);

			if(isInclude && sheet.getFormUrl()) {
				console.log(`rename ${sheet.getSheetName()} to ${this.sheetName}`)
				sheet.setName(this.sheetName)
				break
			}
		}
	}

	public unlink(today:string) {
		// sheetName of unlink and generate are different
		const sheets = this.sheet.sheets;
		sheets.forEach(sheet => {
			try {
				const comparedSheetName: string = sheet.getSheetName() // delete candidate form name
				const formUrl = sheet.getFormUrl() // delete candidate form URL

				if (comparedSheetName.includes("-") && formUrl) {
					const isTodayLater: boolean = Utility.dateOrder(comparedSheetName, today) //if right side date is later, then return true
					console.log(`${today} is later than ${comparedSheetName}: ${String(isTodayLater)}`)
					if (isTodayLater) {
						const form = FormApp.openByUrl(formUrl);
						form.removeDestination(); //unlink sheet
						this.sheet.spreadsheet.deleteSheet(sheet); //delete sheet
						console.log(`Sheet ${comparedSheetName} is unlink and delete`)
					}
				}
			} catch (e) {
				//nothing
			}
		})
	}

}