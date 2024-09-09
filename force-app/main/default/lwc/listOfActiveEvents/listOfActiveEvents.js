import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import { createRecord } from 'lightning/uiRecordApi';
import getAllEvents from '@salesforce/apex/EventController.getAllEvents';

import dt_colors from '@salesforce/resourceUrl/datatablecss';
import {loadStyle} from 'lightning/platformResourceLoader';

import PARTICIPANT_OBJECT from '@salesforce/schema/Participant__c';
import PARTICIPANT_NAME from '@salesforce/schema/Participant__c.Name';
import PARTICIPANT_EMAIL from '@salesforce/schema/Participant__c.Email__c';

const columns = [
    { label: 'Event Name', fieldName: 'Event_Name',type:'url',
        typeAttributes:{
            label:{
            fieldName:'Name'
        }, 
        target:'_blank'}, 
},
    { label: 'Start Date', fieldName: 'Start_Date__c', sortable: "true", type: "date", typeAttributes: {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    }},
    { label: 'Number of Participants', fieldName: 'Number_of_Participants__c' },
    {
        type: "button", label: 'Add Participant', typeAttributes: {
            name: 'Add_Participant',
            title: 'Add Participant',
            disabled: false,
            value: 'participant',
            iconPosition: 'left',
            iconName: 'utility:new',
            variant: 'Brand'
        }
    },
    {
        type: "button", label: 'See Details', typeAttributes: {
            name: 'See_Details',
            title: 'See Details',
            disabled: false,
            value: 'details',
            iconPosition: 'left',
            iconName: 'utility:new',
            variant: 'Brand'
        }
    },
];

export default class ListOfActiveEvents extends NavigationMixin(LightningElement) {
    @track sortDirection;
    @track sortBy;
    @track columns = columns;
    @track data;

    @track isModalOpen = false;
    @track selectedEvent;
    @track participantRecord = {};

    participantObject = PARTICIPANT_OBJECT;
    nameField = PARTICIPANT_NAME;
    emailField = PARTICIPANT_EMAIL;

    renderedCallback(){ 
        if(this.isCssLoaded) return
        this.isCssLoaded = true
        loadStyle(this, dt_colors).then(()=>{
            console.log("Loaded Successfully")
        }).catch(error=>{ 
            console.error("Error in loading the colors")
        })
    }

    @wire(getAllEvents) 
    events({error,data}) {
        if (data) {
            data = JSON.parse(JSON.stringify(data));
            data.forEach(element => {
                element.Event_Name="https://playful-narwhal-5w7r6r-dev-ed.trailblaze.lightning.force.com/lightning/r/Event__c/"+element.Id+"/view"
            });
            this.data = data;
        } else if (error) {
            this.data = undefined;
        }
    }

    closeModal() {
        this.isModalOpen = false;
    }

    handleChange(event) {
        this.participantRecord[event.target.name] = event.target.value;
    }

    callRowAction(event){
        const actionName = event.detail.action.name;
        if(actionName=='Add_Participant'){
            this.isModalOpen = true;
            this.selectedEvent = event.detail.row.Id;
        }else if(actionName=='See_Details'){
            window.open("https://playful-narwhal-5w7r6r-dev-ed--c.trailblaze.vf.force.com/apex/EventDetailPage?id="+event.detail.row.Id);
        }
    }

    createParticipant() {
        this.participantRecord['Event__c'] = this.selectedEvent;
        const fields = { ...this.participantRecord };
        const recordInput = { apiName: PARTICIPANT_OBJECT.objectApiName, fields };

        createRecord(recordInput)
            .then((participant) => {
                this.isModalOpen = false;
                window.location.reload();
                //this.dispatchEvent(new ShowToastEvent({
                    //title: 'Success',
                    //message: 'Participant created and added to Event!',
                    //variant: 'success'
                //}));

                //const customEvent = new CustomEvent('recordcreated', {
                    //detail: { recordId: participant.id }
                //});
                //this.dispatchEvent(customEvent);

                //this[NavigationMixin.Navigate]({
                    //type: 'standard__recordPage',
                    //attributes: {
                        //recordId: participant.id,
                        //objectApiName: PARTICIPANT_OBJECT.objectApiName,
                        //actionName: 'view'
                    //}
                //});
            //})
            //.catch(error => {
                //this.dispatchEvent(new ShowToastEvent({
                    //title: 'Error creating record',
                    //message: error.body.message,
                   // variant: 'error'
                //}));
            });
    }

    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.data));
        let keyValue = (a) => {
            return a[fieldname];
        };
        let isReverse = direction === 'asc' ? 1 : -1;
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : '';
            y = keyValue(y) ? keyValue(y) : '';
            return isReverse * ((x > y) - (y > x));
        });
        this.data = parseData;
    }
}
