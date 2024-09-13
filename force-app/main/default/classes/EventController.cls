public with sharing class EventController {
    
    @AuraEnabled(cacheable=true scope='global')
    public static Event__c[] getAllEvents() {
        return[
            SELECT
            Id,
            Name,
            Start_Date__c,
            Number_of_Participants__c
            FROM Event__c
            WHERE Active__c=true
            WITH SECURITY_ENFORCED
            ORDER BY Name 
        ];
    }
}