import { LightningElement, wire, track } from 'lwc';
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import { createRecord } from 'lightning/uiRecordApi';
import getAllEvents from '@salesforce/apex/EventController.getAllEvents';

import PARTICIPANT_OBJECT from '@salesforce/schema/Participant__c';
import PARTICIPANT_NAME from '@salesforce/schema/Participant__c.Name';
import PARTICIPANT_EMAIL from '@salesforce/schema/Participant__c.Email__c';

const columns = [
    { label: 'Event Name', fieldName: 'Name' },
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

    @wire(getAllEvents) 
    events(result) {
        if (result.data) {
            this.data = result.data;
        } else if (result.error) {
            this.data = undefined;
        }
    }

    addParticipant(event) {
        this.isModalOpen = true;
        this.selectedEvent = event.detail.row.Id;
    }

    closeModal() {
        this.isModalOpen = false;
    }

    handleChange(event) {
        this.participantRecord[event.target.name] = event.target.value;
    }

    createParticipant() {
        this.participantRecord['Event__c'] = this.selectedEvent;
        const fields = { ...this.participantRecord };
        const recordInput = { apiName: PARTICIPANT_OBJECT.objectApiName, fields };

        createRecord(recordInput)
            .then((participant) => {
                this.isModalOpen = false;
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Participant created and added to Event!',
                    variant: 'success'
                }));

                const customEvent = new CustomEvent('recordcreated', {
                    detail: { recordId: participant.id }
                });
                this.dispatchEvent(customEvent);

                this[NavigationMixin.Navigate]({
                    type: 'standard__recordPage',
                    attributes: {
                        recordId: participant.id,
                        objectApiName: PARTICIPANT_OBJECT.objectApiName,
                        actionName: 'view'
                    }
                });
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error creating record',
                    message: error.body.message,
                    variant: 'error'
                }));
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
