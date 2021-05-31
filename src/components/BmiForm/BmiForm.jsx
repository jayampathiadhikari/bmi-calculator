import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import '../App/App.css';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useSpeechSynthesis } from 'react-speech-kit';
import { Grid } from '@material-ui/core'
import DatePicker from 'react-date-picker';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';

const options = [
	{ value: 'metric', label: 'Metric (kg/cm)' },
	{ value: 'imperial', label: 'Imperial (lb/ft)' },
];

const initialValues = {
	weight: '',
	height: '',
	date: ''
}

let speechRecognitionOn = false;
const BmiForm = ({ change }) => {
	const [state, setState] = useState(initialValues);
	const [weightError, setWeightError] = useState({ error: false, errorMsg: "" })
	const [heightError, setHeightError] = useState({ error: false, errorMsg: "" })
	const [oldTranscript, setOldTranscript] = useState('');
	const [speechValue, setSpeechValue] = useState("");
	const { speak, cancel, speaking } = useSpeechSynthesis();
	const { transcript, resetTranscript } = useSpeechRecognition();
	const [calendarDate, onChange] = useState(new Date());
	const [unit, setUnit] = useState({ value: 'metric', label: 'Metric (kg/cm)' });

	let heightMax = 200
	let weightMax = 500

	const selectWUnit = ()=>{
		if (unit.value==="metric"){
			return ("kg")
		}else{
			return ("lb")
		}
	}
	const selectHUnit = ()=>{
		if (unit.value==="metric"){
			return ("cm")
		}else{
			return ("ft")
		}
	}
	const getVoiceBtnClassName = ()=>{
		if (speechRecognitionOn){
			return "calculate-btn voice-button-on"
		}else{
			return "calculate-btn"
		}
	}

	useEffect(()=>{

	},[speechRecognitionOn])

	useEffect( ()=>{

		fetch("https://ipinfo.io/?token=575df63ec9a20d",{mode:"cors",headers: {
				'Content-Type': 'application/json'
			}}).then(res=>res.json()).then(data=> {
			if (data.country==="US"){
				//imperial system
				//change unit to imperial
				setUnit({ value: 'imperial', label: 'Imperial (lb/ft)' })
				console.log("Using imperial unit system");
			}else{
				setUnit({ value: 'metric', label: 'Metric (kg/cm)' })
				console.log("Using metric unit system");
			}
		})
	},[])

	useEffect(() => {
		if (transcript === "" || transcript === oldTranscript) {
			return;
		}
		if (transcript.includes("off") || transcript.includes("shut") || transcript.includes("kill")||transcript.includes("stop")) {
			SpeechRecognition.abortListening();
			setOldTranscript("")
			speechRecognitionOn = false;
			setSpeechValue("Speech assistant stopped");
		}
		if (transcript.includes("reset")) {
			setOldTranscript("")
			resetTranscript();
			setSpeechValue("Reset the values");
		}
		if (transcript.length > 100) {
			setOldTranscript("");
			resetTranscript();
		}
		if ((transcript.includes("kilo") || transcript.includes("kg")|| transcript.includes("grams"))) {
			let weightTemp = 0;
			weightTemp = transcript.replace(/[^0-9]/g, "");
			if (weightTemp<25 || weightTemp>300){
				setSpeechValue(weightTemp+" is an invalid weight. Please enter your weight again.");
				resetTranscript();
				return;
			}
			setState({
				...state,
				weight: weightTemp,
				dateObject: new Date(calendarDate)
			})
			function s(val, callback = function d(){
				setTimeout(resetTranscript,2000)}){
				setSpeechValue("Your weight is "+weightTemp+". Now, please speak your height");
			}
			s()
			resetTranscript();

		}

		if ((transcript.includes("cm") || transcript.includes("centi") || transcript.includes("meter") ||  transcript.includes("CM"))) {
			let heightTemp = 1;
			heightTemp = transcript.replace(/[^0-9]/g, "");
			// validate
			if (heightTemp<50 || heightTemp>250){
				setSpeechValue(heightTemp+" is an invalid height. Please enter your height again.");
				resetTranscript();
				return;
			}
			setState({
				...state,
				height : heightTemp,
				dateObject: new Date(calendarDate)
			})

			let bmi = 0;
			let hinM = heightTemp/100;
			bmi = state.weight / hinM**2;
			bmi = bmi.toFixed(2)
			//todo categorize the output and read
			let status = ""
			if (bmi<18.5){
				status = "underweight";
			}else if (bmi<25){
				status = "healthy";
			}else if (bmi<29){
				status = "overweight"
			}else if (bmi<30){
				status = "obese"
			}else{
				status = "extremely obese"
			}
			setSpeechValue("Your height is "+heightTemp+". Your BMI is "+bmi+". According to your BMI, you are "+status);
			resetTranscript();
		}
		setOldTranscript(transcript);
		console.log(transcript);
	}, [transcript])

	useEffect(() => {
		if (speaking) {
			cancel()
		}
		speak({ text: speechValue })
	}, [speechValue])

	const toggleListen = () => { //continuously listen from mic

		if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
			let txt = "Your Browser is not supported. Please switch to Google Chrome to enable speech support";
			console.error(txt)
			setSpeechValue(txt);
			return null
		}
		speechRecognitionOn = !speechRecognitionOn;
		if (speechRecognitionOn) {
			setSpeechValue("Speech assistant started... Please speak your weight to calculate your B M I ");
			return SpeechRecognition.startListening({ continuous: true })
		} else {
			speechRecognitionOn = false;
			setSpeechValue("Speech assistant stopped");
			SpeechRecognition.stopListening();
		}

	}



	const handleChangeWeight = e => {
		let { value, name } = e.target;
		console.log(value)
		if ((value > 999 || value < 1) && value !== "") {
			setWeightError({ error: true, errorMsg: `Enter valid weight between 1 and ${weightMax}` })
			setTimeout(() => {
				setWeightError({ error: false, errorMsg: "" })
			}, 5000)
		}
		else if (isNaN(parseFloat(value)) && value !== "") {
			setWeightError({ error: true, errorMsg: "Invalid input" })
			setTimeout(() => {
				setWeightError({ error: false, errorMsg: "" })
			}, 5000)
		} else {
			setWeightError({ error: false, errorMsg: "" })
			const date = calendarDate.toLocaleString().split(',')[0];
			setState({
				...state,
				[name]: value,
				date,
				dateObject: new Date(calendarDate)
			});
		}
	};

	const handleChangeHeight = e => {
		let { value, name } = e.target;
		console.log(value)
		if ((value > 999 || value < 1) && value !== "") {
			setHeightError({ error: true, errorMsg: `Enter valid height between 1 and ${heightMax}` })
			setTimeout(() => {
				setHeightError({ error: false, errorMsg: "" })
			}, 5000)
		}
		else if (isNaN(parseFloat(value)) && value !== "") {
			setHeightError({ error: true, errorMsg: "Invalid input" })
			setTimeout(() => {
				setHeightError({ error: false, errorMsg: "" })
			}, 5000)
		} else {
			setHeightError({ error: false, errorMsg: "" })
			const date = calendarDate.toLocaleString().split(',')[0];
			setState({
				...state,
				[name]: value,
				date,
				dateObject: new Date(calendarDate)
			});
		}
	};

	const onChangeDate = date => {
		onChange(date);
		console.log(date, calendarDate);
	  };

	const handleSubmit = () => {
		change(state);
		setState(initialValues);
	};

	return (
		<>
			<div className="container">
			<div className="center">
				<Grid container spacing={2}>
					<Grid item xs={12} sm={12}>
						<Grid item xs={12} sm={12}>
							<div className='row center'>
								<h1 className='white-text' style={{marginBottom:'2px', marginTop: '60px'}}> BMI Tracker </h1>
							</div>
						</Grid>
						<Grid item xs={12} sm={12}>
							<div>
								<h6 className='white-text'> Body mass index (BMI) Tracker tracks your BMI changes. </h6>
							</div>
						</Grid>
					</Grid>
					<Grid item xs={12} sm={12}>
						<div className='voice-button'>
							<button className={getVoiceBtnClassName()} onClick={toggleListen}>Speech Assistant</button>
							<p className={"speech-out"}>{transcript}</p>

						</div>
					</Grid>
					<Grid item xs={4} sm={4} >

					</Grid>
					<Grid item xs={4} sm={4}>
						<Dropdown options={options} onChange={setUnit} value={unit} placeholder="Select an option" />
					</Grid>
				</Grid>
				<Grid container  >
					<Grid item xs={12} sm={6}>
						<label htmlFor="weight">Weight (in {selectWUnit()})</label>
						<input
							className={"bmiform"}
							id="weight"
							name="weight"
							placeholder="Weight"
							value={state.weight}
							onChange={handleChangeWeight}
						/>
						<p className="error">{weightError.errorMsg}</p>
					</Grid>
					<Grid item xs={12} sm={6}>
						<label htmlFor="height">Height (in {selectHUnit()})</label>
						<input
							className={"bmiform"}
							id="height"
							name="height"
							placeholder="Height"
							value={state.height}
							onChange={handleChangeHeight}
						/>
						<p className="error">{heightError.errorMsg}</p>
					</Grid>

				</Grid>
				<Grid item xs={12} sm={12}>
					<div className='col m12 s12'>
						<div>
							<label>Date</label>
							<DatePicker
								onChange={onChangeDate}
								value={calendarDate}
								maxDate={new Date()}
							/>
						</div>
					</div>
				</Grid>
				<Grid item xs={12} sm={12}>
				<div style={{marginTop: '30px'}}>
					<button
						id="bmi-btn"
						className="calculate-btn"
						type="button"
						disabled={state.weight === '' || state.height === ''}
						onClick={handleSubmit}
					>
						Calculate BMI
					</button>
				</div>
				</Grid>
			</div>
			</div>
		</>
	);
};

BmiForm.propTypes = {
	change: PropTypes.func.isRequired
};

export default BmiForm;
