public class NumberOfParticipants {
    
    public static void getNumberOfEventParticipants(){
        
        List<Participant__c> participantList=[SELECT Name,Event__c FROM Participant__c];
        
        List<Event__c> eventList=[SELECT Name,Number_of_Participants__c FROM Event__c];
                
        for(Event__c event:eventList){
            Integer countOfParticipant=0;
            for(Participant__c participant:participantList){     
                if(participant.Event__c!=null && (event.Id==participant.Event__c)){
                    countOfParticipant++;
                }
            }
            event.Number_of_Participants__c=countOfParticipant;
            update event;
        }
      
    }
}