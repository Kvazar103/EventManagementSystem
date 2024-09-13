public with sharing class EventDetailController {
    
    public Id eventId { get; set; }
    public Event__c eventDetail { get; set; }
    public List<Participant__c> participants { get; set; }
    
    public EventDetailController() {
        eventId = ApexPages.currentPage().getParameters().get('id');
        if(eventId != null) {
            eventDetail = [SELECT Id, Name, Start_Date__c, Number_of_Participants__c 
                           FROM Event__c WHERE Id = :eventId LIMIT 1];
            participants = [SELECT Id, Name, Email__c FROM Participant__c WHERE Event__c = :eventId];
        }
    }
}